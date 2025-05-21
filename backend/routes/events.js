const express = require('express');
const router = express.Router();
const {
  add_new_event,
  delete_event,
  join_event,
  get_upcoming_events
} = require('../dbFunctions');

// Créer un nouvel événement
router.post('/', async (req, res) => {
  const { gameId, creatorId, description, title, localisation, date } = req.body;
  const result = await add_new_event(creatorId, title, description, date, localisation, gameId);
  if (result.success) {
    res.status(201).json({ eventId: result.eventId });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Supprimer un événement
router.delete('/:id', async (req, res) => {
  const eventId = req.params.id;
  const result = await delete_event(eventId);
  if (result.success) {
    res.status(200).json({ message: 'Événement supprimé avec succès' });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Rejoindre un événement
router.post('/:id/register', async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;
  const result = await join_event(userId, eventId);
  if (result.success) {
    res.status(200).json({ message: 'Utilisateur ajouté à l’événement' });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Obtenir les événements à venir
router.get('/upcoming', async (req, res) => {
  const result = await get_upcoming_events();
  if (result.success) {
    res.json(result.events);
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;
