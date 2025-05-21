const express = require('express');
const router = express.Router();
const {
  get_recommendations,
  get_game_by_id,
  get_stats
} = require('../dbFunctions');

// Obtenir des recommandations de jeux
router.post('/recommendations', async (req, res) => {
  const {maxPlaytime, userAge, availablePlayers } = req.body;
  const result = await get_recommendations(maxPlaytime, userAge, availablePlayers);
  if (result.success) {
    res.json(result.games);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Obtenir des statistiques sur les jeux
router.get('/stats', async (req, res) => {
  const result = await get_stats();
  if (result.success) {
    res.json(result.stats);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.get('/:id', async (req, res) => {
  const gameId = req.params.id;
  const result = await get_game_by_id(gameId);
  if (result.success) {
    res.json(result.game);
  } else {
    res.status(404).json({ error: result.error });
  }
});


module.exports = router;
