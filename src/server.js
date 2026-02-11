require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const authRoutes = require('./routes/auth.routes')
const authenticateToken = require('./middlewares/auth.middleware')
const configureSockets = require('./sockets/chat.socket')
const initDatabase = require('./config/initDatabase')
const messageRoutes = require('./routes/message.routes')

const app = express()
const server = http.createServer(app)

// ✅ CORS sécurisé pour la production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL  // URL de ton frontend en production
].filter(Boolean)

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ message: "Chat API running 🚀" })
})

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    id: req.user.id,
    email: req.user.email
  })
})

app.use('/api/messages', messageRoutes)

// Initialiser la DB
initDatabase()

// Configurer Socket.io
configureSockets(server)

// Démarrer le serveur
const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)  // ✅ Syntaxe corrigée
  console.log(`🌍 Allowed origins:`, allowedOrigins)
})