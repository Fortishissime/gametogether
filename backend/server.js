const express = require('express');
const app = express();
const { initDB } = require('./db');
const cors = require('cors');

// Importation des routes
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const gameRoutes = require('./routes/games');

app.use(express.json());

// Initialisation de la base de données

async function main() {

  console.log("\n--- Démarrage du serveur backend ---")
  console.log("\n[+] Initialisation de la base de donnée.\n")
  await initDB();

  console.log("\n[+] Paramétrage des autorisations nécessaire au front-end.")

  app.use(cors({
  origin: 'http://localhost:5173', // autorise uniquement le front Vite
  credentials: true // si tu veux autoriser les cookies / auth
  }));

  console.log("[OK] Paramétrage terminé")

  console.log(" \n[+] Chargement des routes API\n")

  app.use('/api/users', userRoutes);
  console.log("- /api/users ajouté")

  app.use('/api/events', eventRoutes);
  console.log("- /api/events ajouté")

  app.use('/api/games', gameRoutes);
  console.log("- /api/games ajouté")

  console.log("\n[OK] Routes chargées.")

  app.listen(3000, () => {
  console.log('\n[ACTIF] - Serveur backend lancé sur http://localhost:3000');
});}

main();