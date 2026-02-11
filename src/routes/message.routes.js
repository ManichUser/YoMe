const express = require('express')
const router = express.Router()
const db = require('../config/database')
const authenticateToken = require('../middlewares/auth.middleware')

// Récupérer tous les messages
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT m.id, m.sender_id, u.email AS sender_email, m.content, m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    ORDER BY m.created_at ASC
  `
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

// Ajouter un message
router.post('/', authenticateToken, (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ message: 'Content required' })

  db.run(
    "INSERT INTO messages (sender_id, content) VALUES (?, ?)",
    [req.user.id, content],
    function(err) {
      if (err) return res.status(500).json({ message: err.message })
      res.json({
        id: this.lastID,
        sender_id: req.user.id,
        content,
        created_at: new Date()
      })
    }
  )
})

module.exports = router
