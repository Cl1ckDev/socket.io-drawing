const app = require('express')()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const port = process.env.PORT || 4000

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {

  console.log(`connected: ${socket.id}`)
  io.emit('clients', io.engine.clientsCount)

  socket.on('mouse', (data) => {
    socket.broadcast.emit('onDraw', data)
  })

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`)
    socket.broadcast.emit('clients', io.engine.clientsCount)
  })
})

server.listen(port, () => {
  console.log('active')
})