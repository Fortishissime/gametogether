const fs = require('fs');
const readline = require('readline');

const sqlFilePath = './data/insert_data.sql';
const MAX_INSERTS = 500;

const gameInserts = [];
const ratingInserts = [];


async function loadInserts() {
  console.log("here")
  const fileStream = fs.createReadStream(sqlFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith('INSERT INTO Game') && gameInserts.length < MAX_INSERTS) {
      gameInserts.push(trimmed);
    } else if (trimmed.startsWith('INSERT INTO Rating') && ratingInserts.length < MAX_INSERTS) {
      ratingInserts.push(trimmed);
    }

    if (gameInserts.length >= MAX_INSERTS && ratingInserts.length >= MAX_INSERTS) {
      rl.close();
      break;
    }
  }
}

// Export d’une Promise qui se résout quand les données sont chargées
module.exports = (async () => {
  await loadInserts();
  return { gameInserts, ratingInserts };
})();
