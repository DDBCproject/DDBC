const fs          = require('fs')
const bitcoin     = require('bitcoin')
const zmq         = require('zmq')
const mysql       = require('mysql')
const http        = require('http')
const https       = require('https')
const socketio    = require('socket.io')
const express     = require('express')
const cors        = require('cors')
const bodyParser  = require('body-parser')
const basicAuth   = require('express-basic-auth')
const utils       = require('./src/utils')
const _           = require('underscore')

// LOAD config.js
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

// MYSQL server connection -----------------------------------------------------

const dbPool = mysql.createPool(config.mysql)

// Express server --------------------------------------------------------------

const credentials = {
	key: fs.readFileSync(config.ssl.key, 'utf8'),
	cert: fs.readFileSync(config.ssl.cert, 'utf8')
}

const app         = express()
const httpsServer = https.createServer(credentials, app)
const io          = socketio(httpsServer)

io.on('connection', function (socket) {
  	console.log('[socio] socket connection established')
  	
  	// send the current block height on socket connection
  	rpcClient.getBlockCount((err, count) => {

  		if (err) console.error(err)

  		// also send a list of block indexes that contain messages
  		// and bookmarked messages
		dbPool.getConnection((err, connection) => {

			const blocklist = {
				all: [],
				sfw: [],
				valid: [],
				bookmarked: []
			}

			// we will use this to know when to close the MYSQL pool connection
			const done = _.after(4, () => {
				io.emit('blockchain-data', { blocklist, height: count })
				connection.release()
			})

			utils.getBlocklist({}, connection, (err, list) => {
				blocklist.all = list
				done()
			})

			utils.getBlocklist({ valid: true }, connection, (err, list) => {
				blocklist.valid = list
				done()
			})

			utils.getBlocklist({ sfw: true }, connection, (err, list) => {
				blocklist.sfw = list
				done()
			})

			utils.getBlocklist({ bookmarked: true }, connection, (err, list) => {
				blocklist.bookmarked = list
				done()
			})
		})
  	})

	// update the client's mempool size
	rpcClient.getRawMemPool((err, data) => {
		if (err) throw err
		socket.emit('mempool-size', data.length)
	})
})

// allow cross-origin requests
app.use(cors())

// use basic authentication. Reply with a 401 to all non-authed requests.
app.use(basicAuth(config.basicAuth))

// static server for the www/ folder
app.use(express.static('www'))

// the bitcoind rest API doesn't support CORs from localhost:8989, so we
// essentially proxy a request to that API exposed at /api/block
// e.g. http://localhost:8989/api/block?index=0 gives the genesis block
app.get('/api/block', (req, res) => {
	console.log(`[http]  GET ${req.url}`)
	const index = parseInt(req.query.index)
	// given the block index, use the bitcoind JSON RPC api to get the
	// corresponding block hash
	rpcClient.getBlockHash(index, (err, hash) => {
		if (err) {
			res.status(200).send({error: err.message, code: err.code})
		} 
		else {
			// make the "proxied" request to the bitcoind REST API using the block hash
			const url = `http://localhost:${config.bitcoinRPCClient.port}/rest/block/${hash}.json`
			http.get(url, apiRes => {		  		

		  		res.set({'content-type': 'application/json; charset=UTF-8'})
		  		// couldn't get streaming to work (didn't try too hard)
		  		// so instead we will store the buffer in mem, yuck!
		  		let dat = Buffer.from('')
		  		
		  		apiRes.on('data', data => {
		    		dat += data
		  		})
				
				// once we get the result from the bitcoind REST API, forward
				// it along as the result to the original /api/block request
				apiRes.on("end", () => {
			   		res.end(dat)
				})
			})
		}
	})
})

// get an array of message objects for a block using it's block height index
// e.g. http://localhost:8989/api/block/messages?index=0
// could probably use some error handling in here, but ヽ(´ー｀)┌
app.get('/api/block/messages', (req, res) => {
	console.log(`[http]  GET ${req.url}`)
	const index = parseInt(req.query.index)
	dbPool.getConnection((err, connection) => {
		utils.getBlockMessages(index, connection, (err, messages) => {
			console.log('err')
			console.log(err)
			console.log('message')
			console.log(messages)
			res.json(messages)
			connection.release()
		})
	})
})

app.get('/api/filter/blocklist', (req, res) => {
	console.log(`[http]  GET ${req.url}`)
	dbPool.getConnection((err, connection) => {
		console.log('OUT HERE')
		console.log(req.query)
		utils.getBlocklist(req.query, connection, (err, list) => {
			res.send(list)
		})
	})
})

// the search api used by the www/review CMS
app.get('/api/review', (req, res) => {
	
	// query the database using  the provided url params
	console.log(`[http]  GET ${req.url}`)
	dbPool.getConnection((err, connection) => {
		req.query.limit = 5 // set the limit here
		const query = utils.buildSQLSelectQuery(req.query, connection)	
		console.log(`[mysql] ${query}`)
		connection.query(query, (error, results, fields) => {
			if (error) {
				throw error
				res.sendStaus(504)
				connection.release()
			} else {
				// use the original tables to count the number of times each
				// message appears in the blockchain and use socket.io to
				// stream the results to the client with the 'data-count' event
				utils.getDataCounts(
					req.query.table.replace(/_unique$/, ''),
					results.map(x => x.data_hash),
					connection,
					function eachCount(err, dataHash, count) {
						if (err) throw err
						io.emit('data-count', { dataHash, count })
					}, 
					function done(err) {
						if (err) throw err
						connection.release()
						res.send(results)
					}
				)
			}
		})
	})

	// query the database to count the number of results
	dbPool.getConnection((err, connection) => {
		const countQuery = utils.getResultsCount(req.query, connection, (err, count) => {
			if (err) throw err
			io.emit('search-count', { count, clientId: req.query.clientId })
			connection.release()
		})
	})
})

// POST requests to the /api/review can change database state
// we use this endpoint to update the mysql database
app.use('/api/review', bodyParser.json())
app.post('/api/review', (req, res) => {
	console.log(`[https]  POST ${req.body}`)
	dbPool.getConnection((err, connection) => {
		// query for the unique table
		const queryUniq = utils.buildSQLUpdateQuery(req.body, connection)
		
		// query for the original table
		req.body.table = req.body.table.replace(/_unique$/, '')
		const query = utils.buildSQLUpdateQuery(req.body, connection)

		console.log(`[mysql] ${queryUniq}`)
		console.log(`[mysql] ${query}`)

		// update the original and unique database in tandem
		connection.query(queryUniq, cb)
		connection.query(query, cb)

		let numQueriesReturned = 0
		function cb (error, results, fields) {
			numQueriesReturned++
			if (error) {
				console.error('[error] there may now be a database missmatch between the original table and the unique table')
				res.sendStatus(504)
				connection.release()
				throw error
			} else if (numQueriesReturned == 2) {
				res.sendStatus(204)
				connection.release()
			}
		}
	})
})

// start the server
httpsServer.listen(config.port, () => {
	console.log(`[https]  server listening at https://localhost:${config.port}`)
})

//ZeroMQ bitcoind communication ------------------------------------------------

const zmqSock = zmq.socket('sub')
zmqSock.connect(config.bitcoinZMQAddress)
zmqSock.subscribe('rawtx') // this event never fires!
zmqSock.subscribe('hashtx')
zmqSock.subscribe('rawblock')
zmqSock.subscribe('hashblock')
zmqSock.subscribe('') // receive all messages 

zmqSock.on('message', function(topic, message) {

	if (topic == 'rawtx') {
		rpcClient.decodeRawTransaction(message.toString('hex'), (err, tx) => {
			io.emit('received-tx', tx)
		})
	} else if (topic == 'hashblock') {
		let blockHash = message.toString('hex')
		console.log(`[zmq]   recieved a new block ${message.toString('hex')}`)
		const url = `http://localhost:${config.bitcoinRPCClient.port}/rest/block/${blockHash}.json`
		http.get(url, apiRes => {		  		

	  		// couldn't get streaming to work (didn't try too hard)
	  		// so instead we will store the buffer in mem, yuck!
	  		let dat = Buffer.from('')
	  		
	  		apiRes.on('data', data => {
	    		dat += data
	  		})
			
			// once we get the result from the bitcoind REST API, forward
			// it along as the result to the original /api/block request
			apiRes.on("end", () => {
				try {
					const block = JSON.parse(dat.toString())
					// emit the socket.io event
		   			io.emit('received-block', JSON.parse(dat.toString()))
				} catch (err) { /* NOP, in case the response isn't JSON */ }

				// update all of the client's mempool sizes
				rpcClient.getRawMemPool((err, data) => {
					if (err) throw err
					io.emit('mempool-size', data.length)
				})
			})
		})
	}
})

// JSONRPC bitcoind communication ----------------------------------------------

// https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list
const rpcClient = new bitcoin.Client(config.bitcoinRPCClient)

// broadcast the current list of bitcoind peers to all connected socket.io
// clients at an interval set by config.peerInfoRefreshInterval
setInterval(() => {
	rpcClient.getPeerInfo(function(err, data) {
		if (err) {
			console.log('[!] error in rpcClient.getPeerInfo(...)')
			console.error(err)
		}
		else {
			io.emit('peer-info', data)
		}
	})
}, config.peerInfoRefreshInterval)
