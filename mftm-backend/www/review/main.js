let filter = {
	table: 'coinbase_messages',
	reviewed: undefined,
	valid: undefined,
	bookmarked: undefined,
	unique: true,
	transaction: undefined,
	nsfw: undefined,
	annotated: undefined,
	search: undefined,
	tags: '',
	offset: 0,
	clientId: Math.random()
}

// let results = [{
// 	id: 0,
// 	transaction: 'hash',
// 	data: 'blah blah',
// 	filetype: 'text',
// 	valid: true,
// 	tags: ['blah', 'blue', 'blarb'],
// 	bookmarked: false,
// 	annotated: "here yee lies the king",
//  nsfw: false
// 	reviewed: null
// }]

var app = new Vue({
  el: '#app',
  data: { filter, 
  	      results: [], 
  	      resultsCount: 0,
  	      progressCount: 0,
  	      autoreview: false }
})

Vue.config.devtools = true

document.getElementById('filter-button').onclick = search

document.getElementById('next-button').onclick = (e) => {
	app.filter.offset = (parseInt(app.filter.offset) || 0) + 5
	search()
	e.preventDefault()
}

document.getElementById('prev-button').onclick = (e) => {
	app.filter.offset = Math.max(0, parseInt(app.filter.offset) - 5)
	search()
	e.preventDefault()
}

String.prototype.insertAt=function(index, string) { 
  return this.substr(0, index) + string + this.substr(index);
}

String.prototype.removeCharAt = function(index) {
	return this.slice(0, index) + this.slice(index + 1);
}

// a map from data_hash => count used to display the number of times a message
// appears in the database
const dataCounts = {}
const socket = io.connect(`https://${location.host}`)
// the number of times a message appears in the blockchain
// data = {blockHash, count}
socket.on('data-count', data => {
	dataCounts[data.dataHash] = data.count
})

socket.on('search-count', data => {
	// this is kind of a hack because the 'search-count' event is broadcast to
	// all clients :/
	if (parseFloat(data.clientId) == filter.clientId)
		app.resultsCount = data.count
})

document.onload = search()

// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function commaFormatNumber(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function encodeHexString(string) {
	let encoded = ''
	for (let i = 0; i < string.length; i++) {
		encoded += string.charCodeAt(i).toString(16)
	}
	return encoded
}

function allValid() {
	app.results.forEach(res => {
		res.valid = true
		updateRecord('valid', res)
	})

}

function autoreview() {
	if (app.autoreview) {
		app.results.forEach((result) => {
			result.reviewed = true
			updateRecord('reviewed', result)
		})
	}
}

function formatUTF8(result) {

	if (result.displayData.length < 20) return

	if (result.format) {
		let formatted = ''
		for (let i = 0; i < result.displayData.length; i += 20) {
			formatted += result.displayData.slice(i, i + 20) + '\n'
		}
		result.displayData = formatted
	}
}

function search() {

	autoreview()

	// make a copy, because we are going to mutate some of the data and 
	// we don't want that to show up in the view
	let filter = JSON.parse(JSON.stringify(app.filter))
	if (filter.transaction == '') filter.transaction = undefined
	if (filter.search == '') filter.search = undefined

	if (filter.search) {
		filter.search = encodeHexString(filter.search)
	}

	if (filter.unique) {
		filter.table += '_unique'
		filter.unique = undefined
	}

	filter.tags = app.filter.tags.split(',')
								 .map(x => x.trim())
								 .filter(x => x != '')

	// out vue interface sets the value of some properties to "undefined"
	// instead of undefined. Fix this here.
	for (key in filter) {
		if (filter[key] == "undefined") filter[key] = undefined
	}

	app.results = []
	app.progressCount = 0
	const prevScrollHeight = window.pageYOffset
	const url = `${window.location.protocol}//${window.location.host}/api/review?${Qs.stringify(filter)}`
	fetch(url, { method: 'get', headers: getAuthHeaders() })
	.then(res => res.json())
	.then(json => {

		app.progressCount = parseInt(app.filter.offset) + json.length
		json.forEach(obj => {
			obj.expanded = true
			if (dataCounts.hasOwnProperty(obj.data_hash)) {
				obj.count = dataCounts[obj.data_hash]
			}
			obj.displayData = obj.utf8_data
			if (obj.format) {
				formatUTF8(obj)
			}
			obj.tags = decodeTagString(obj.tags)
		})
		app.results = json
		
		// this doesn't work without a setTimeout
		setTimeout(() => window.scrollTo(0, prevScrollHeight), 0)


	})
}

function encodeTagsString(tags) {
	return ',' + tags.split(',').map(x => x.trim()).filter(x => x != '').join(',') + ','
}

function decodeTagString(string) {
	return string.split(',') // replace ','
	             .join(', ') // with ', '
	             .replace(/^, /, '') // remove leading ', '
	             .replace(/, $/, '') // remove trailing ', '
}

function updateRecord(prop, result) {
	
	const url = `${window.location.protocol}//${window.location.host}/api/review`
	
	let value = result[prop]
	if (prop == 'tags') {
		value = encodeTagsString(value)
	}

	const body = {
		table: filter.table + '_unique',
		data: result.data,
		update: prop,
		value: value
	}
	
	const headers = getAuthHeaders()
	headers.append('Accept', 'application/json')
	headers.append('Content-Type', 'application/json')

	fetch(url, { method: 'post', body: JSON.stringify(body), headers })
}