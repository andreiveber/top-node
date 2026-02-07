const http = require('http')
const Progress = require('progress')

const hostname = "127.0.0.1"
const port = '3001'

const server = http.createServer((req, res) => {
	res.statusCode = 200
	res.setHeader('Content-type', 'text/plain')

	const bar = new Progress(':bar', { total: 10 })
	const timer = setInterval(() => {
		bar.tick()
		if (bar.complete) {
			clearInterval(timer)
		}
	}, 1000)

	res.end('Hello World')
})


server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}`)
})

