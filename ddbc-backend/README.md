This repo contains `Node.js` server-side code for *Messages from the Mines*. It does the following:

- Serves the front-end from `ddbc-frontend` (Not yet)
- Exposes the `ddbc-database` MySQL database as a web API (see <https://localhost:8989/example-frontend>).
- Launches the Bitcoin Core node via `start_bitcoind.sh`. 
- Communicates with `bitcoind` daemon via JSONRPC.
- Serves an admin data review CMS at <https://localhost:8989/review>

## Installing Dependencies

```bash
# install the ZeroMQ development files
sudo apt-get update
sudo apt-get install libzmq3-dev

# install the npm modules
npm install
```

## Generate SSL key pair

For security reasons, we haven't included keys in the `ssl/` folder. Create some once you've cloned:

```bash
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout ssl/private.key -out ssl/certificate.crt
```

## Edit credentials in `config.json` and `bitcoin.conf`

[`config.json`](config.json) comes with dummy values for:
	- Basic authentication user/pass
	- MySQL user/pass
	- `bitcoind` JSONRPC user/pass

Edit `basicAuth.users`, `mysql.user`, `mysql.password`, `bitcoinRPCClient.user`, and `bitcoinRPCClient.pass`.

```json
{
	"port": 8989,
	"peerInfoRefreshInterval": 10000,
	"bitcoinZMQAddress": "tcp://127.0.0.1:28332",
	"basicAuth": {
		"users": {
			"admin": "change-me-or-get-pwned"
		},
		"challenge": true
	},
	"ssl": {
		"key": "ssl/private.key",
		"cert": "ssl/certificate.crt"
	},
	"mysql": {
		"connectionLimit": 100,
		"host": "localhost",
		"user": "root",
		"password": "change-me-or-get-pwned",
		"database": "messages_from_the_mines"
	},
	"bitcoinRPCClient": {
		"host": "localhost",
	  	"port": 8332,
	  	"user": "admin",
	  	"pass": "change-me-or-get-pwned",
	  	"timeout": 30000
	}
}
```

[`bitcoin.conf`](bitcoin.conf) contains dummy values for `rpcuser` and `rpcpassword` as well. Change those too.

```
rpcuser=admin
rpcpassword=change-me-or-get-pwned
```

## Start the `bitcoind` Daemon

Bitcoin Core must be running for `server.js` to work properly. Before running, change `-datadir` to point to your Bitcoin Core data folder (usually `~/.bitcoin`) in `start_bitcoind.sh`.

```bash
# change -datadir directory and save the file
nano start_bitcoind.sh

# start the bitcoind server
./start_bitcoin.sh
```

## Launch the Server
Once `bitcoind` is running, launch the node server:

```bash
node server
```
