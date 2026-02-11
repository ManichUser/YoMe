const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const db = require('../config/database')
require('dotenv').config()

const configureSockets = (server) => {
  // ✅ CORS sécurisé pour Socket.io
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yu-me.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean)

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  // Middleware JWT pour Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Auth error: token required'))
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return next(new Error('Auth error: invalid token'))
      socket.user = user
      next()
    })
  })

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.email} (${socket.id})`)  // ✅ Syntaxe corrigée

    // Recevoir un message
    socket.on('send_message', (data) => {
      const { content } = data
      
      // Sauvegarder en DB
      db.run(
        "INSERT INTO messages (sender_id, content) VALUES (?, ?)",
        [socket.user.id, content],
        function(err) {
          if (err) {
            console.error('❌ DB insert error:', err.message)
            return
          }
          
          // ✅ Message complet avec sender_email
          const message = {
            id: this.lastID,
            sender_id: socket.user.id,
            sender_email: socket.user.email,
            content,
            created_at: new Date()
          }
          
          // Envoyer à tous les utilisateurs connectés
          io.emit('receive_message', message)
        }
      )
    })

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.email} (${socket.id})`)  // ✅ Syntaxe corrigée
    })
  })

  return io
}

module.exports = configureSockets