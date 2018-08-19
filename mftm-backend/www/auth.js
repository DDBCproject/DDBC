function getAuthHeaders() {

	// change these two variables to match what you have saved in config.json
	// e.g.
	// 	"basicAuth": {
	// 		"users": {
	//			"admin": "change-me-or-get-pwned"
	//		}
	const user = 'admin'
	const pw = 'change-me-or-get-pwned'

	const headers = new Headers()
	headers.append('Authorization', 'Basic ' + base64(user + ':' + pw))
	return headers

	function base64(text) {
		return btoa(unescape(encodeURIComponent(text)))
	}
}

// Free geo-ip lookup API. Get a free key at https://ipstack.com/
let IPSTACK_KEY = '' 
