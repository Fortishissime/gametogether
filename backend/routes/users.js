const express = require('express');
const router = express.Router();
const { add_new_user, get_user_event_history, login_user, get_logs } = require('../dbFunctions');

// Route pour créer un nouvel utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const result = await add_new_user(username, email, password);
  if (result.success) {
    res.status(201).json({ userId: result.userId, username: username, email: email });
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

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier = username ou email

  if (!identifier || !password) {
    return res.status(400).json({ error: "Veuillez fournir un nom d'utilisateur/email et un mot de passe." });
  }

  const result = await login_user(identifier, password);

  if (result.success) {
    // Renvoie les infos utilisateur (sans le password)
    res.json({ userId: result.userId, username: result.username, email: result.email });
  } else {
    res.status(401).json({ error: result.error });
  }
});

router.get('/logs', async (req, res) => {
  const result = await get_logs();
  if (result.success) {
    res.json(result.logs);
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;
