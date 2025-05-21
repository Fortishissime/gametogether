const express = require('express');
const router = express.Router();
const { add_new_user, get_user_event_history } = require('../dbFunctions');

// Route pour créer un nouvel utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const result = await add_new_user(username, email, password);
  if (result.success) {
    res.status(201).json({ userId: result.userId });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Route pour obtenir l'historique des événements d'un utilisateur
router.get('/:id/history', async (req, res) => {
  const userId = req.params.id;
  const result = await get_user_event_history(userId);
  if (result.success) {
    res.json(result.history);
  } else {
    res.status(400).json({ error: result.error });
  }
});

module.exports = router;
