const express = require('express');
const router = express.Router();
const {
  get_game_recommendations,
  get_game_statistics
} = require('../dbFunctions');

// Obtenir des recommandations de jeux
router.get('/recommendations', async (req, res) => {
  const result = await get_game_recommendations();
  if (result.success) {
    res.json(result.recommendations);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Obtenir des statistiques sur les jeux
router.get('/stats', async (req, res) => {
  const result = await get_game_statistics();
  if (result.success) {
    res.json(result.stats);
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;
