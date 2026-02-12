const http = require('http')
const fs = require('fs').promises
const path = require('path')

const hostname = "0.0.0.0"
const port = '3001'
const DATA_FILE = path.join(__dirname, 'data.json')

async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
    }

    if (req.method === 'POST' && req.url === '/data') {
        let body = ''

        req.on('data', chunk => {
            body += chunk.toString()
        })

        req.on('end', async () => {
            try {
                const newData = JSON.parse(body)
                const allData = await readData()

                const dataToSave = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    name: newData.name || '',
                    message: newData.message || ''
                }

                allData.push(dataToSave)
                await writeData(allData)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                    id: dataToSave.id,
                    timestamp: dataToSave.timestamp,
                    name: dataToSave.name,
                    message: dataToSave.message
                }))

            } catch (error) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                    error: 'Invalid JSON',
                    details: error.message
                }))
            }
        })
        return
    }

    if (req.method === 'GET' && req.url === '/data') {
        try {
            const allData = await readData()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(allData))
        } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
        }
        return
    }

    if (req.method === 'GET' && req.url === '/') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Server — 4 параметра</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
                    code { color: #d63384; }
                </style>
            </head>
            <body>
                <h1>Сервер работает</h1>
                <h3>POST /data — принимает 4 параметра:</h3>
                <pre>{
    "id": 1739452800000,
    "timestamp": "2026-02-12T21:20:00.000Z", 
    "name": "Иван",
    "message": "Привет"
}</pre>
                <p>Отправить тестовый запрос:</p>
                <pre>
curl -X POST http://localhost:3001/data \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Иван", "message": "Контрольная работа"}'
                </pre>
                <p><a href="/data">Посмотреть все сохраненные записи</a></p>
            </body>
            </html>
        `)
        return
    }

    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(port, hostname, () => {
    console.log(`Сервер запущен на http://${hostname}:${port}`)
    console.log(`POST /data — принимает 4 параметра`)
    console.log(`GET  /data — просмотр всех записей`)
})