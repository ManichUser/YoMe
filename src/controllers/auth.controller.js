const db = require('../config/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const login = (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: err.message })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' })
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({ token })
  })
}

// ⬇️ AJOUTE CETTE FONCTION
const getMe = (req, res) => {
  // req.user vient du middleware authenticateToken
  res.json({ 
    id: req.user.id, 
    email: req.user.email 
  })
}

module.exports = { login, getMe }  // ← N'oublie pas d'exporter getMe