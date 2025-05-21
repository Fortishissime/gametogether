const { pool } = require('./db');


async function add_new_user(username, email, password) {
  try {
    const registerDate = new Date().toISOString().split('T')[0];
    const sql = `
      INSERT INTO User (Username, Email, Password, Register_date)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [username, email, password, registerDate]);
    return { success: true, userId: result.insertId };
  } catch (err) {
    console.error('Erreur add_new_user:', err.message);
    return { success: false, error: err.message };
  }
}

async function login_user(identifier, password) {
  try {
    const sql = `
      SELECT User_id, Username, Email, Register_date
      FROM User
      WHERE (Username = ? OR Email = ?) AND Password = ?
      LIMIT 1
    `;
    const [result] = await pool.query(sql, [identifier, identifier, password]);

    if (result.length === 0) {
      return { success: false, error: 'Identifiants incorrects.' };
    }

    const data = result[0]

    return {
      success: true,
      userId: data.User_id,
      username: data.Username,
      email: data.Email
    };

  } catch (err) {
    console.error('Erreur login_user:', err.message);
    return { success: false, error: err.message };
  }
}


async function add_new_event(creatorId, title, description, date, location, gameId) {
  try {
    const sql = `CALL CreateEvent(?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [creatorId, title, description, date, location, gameId]);
    return { success: true };
  } catch (err) {
    console.error('Erreur add_new_event:', err.message);
    return { success: false, error: err.message };
  }
}


async function remove_event(eventId) {
  try {
    const sql = `DELETE FROM Event WHERE Event_id = ?`;
    const [result] = await pool.query(sql, [eventId]);
    return result.affectedRows > 0
      ? { success: true }
      : { success: false, message: 'Aucun événement supprimé (ID introuvable)' };
  } catch (err) {
    console.error('Erreur remove_event:', err.message);
    return { success: false, error: err.message };
  }
}

async function join_event(userId, eventId) {
  try {
    const sql = `CALL JoinEvent(?, ?)`;
    await pool.query(sql, [userId, eventId]);
    return { success: true };
  } catch (err) {
    console.error('Erreur join_event:', err.message);
    return { success: false, error: err.message };
  }
}


async function get_recommendations(maxPlaytime, userAge, availablePlayers) {
  try {
    const sql = `CALL GetRecommendedGames(?, ?, ?)`;
    const [rows] = await pool.query(sql, [maxPlaytime, userAge, availablePlayers]);
    return { success: true, games: rows[0] };
  } catch (err) {
    console.error('Erreur get_recommendations:', err.message);
    return { success: false, error: err.message };
  }
}

async function get_upcoming_events() {
  try {
    const sql = `
      SELECT 
        e.*, 
        COUNT(p.User_id) AS ParticipantsCount
      FROM Upcoming_Events e
      LEFT JOIN Participer p ON e.Event_id = p.Event_id
      GROUP BY e.Event_id
      ORDER BY e.Event_date ASC
    `;
    const [rows] = await pool.query(sql);
    return { success: true, events: rows };
  } catch (err) {
    console.error('Erreur list_upcoming_events:', err.message);
    return { success: false, error: err.message };
  }
}

async function get_user_event_history(userId) {
  try {
    const sql = `
      SELECT * FROM User_Event_History 
      WHERE User_id = ? 
      ORDER BY Event_date ASC
    `;
    console.log("hey")
    console.log(userId)
    const [rows] = await pool.query(sql, [userId]);
    console.log(rows)
    return { success: true, history: rows };
  } catch (err) {
    console.error('Erreur get_user_event_history:', err.message);
    return { success: false, error: err.message };
  }
}

async function get_stats() {
  try {
    const sql = `SELECT * FROM Games_Stats ORDER BY Average_rate DESC`;
    const [rows] = await pool.query(sql);
    return { success: true, stats: rows };
  } catch (err) {
    console.error('Erreur get_stats:', err.message);
    return { success: false, error: err.message };
  }
}

async function get_game_by_id(gameId) {
  try {
    const sql = `
      SELECT 
        g.*, 
        r.Average_Rate, 
        r.IdRank
      FROM Game g
      LEFT JOIN Rating r ON g.Game_id = r.Game_Id
      WHERE g.Game_id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [gameId]);

    if (rows.length === 0) {
      return { success: false, error: 'Jeu non trouvé.' };
    }

    return { success: true, game: rows[0] };
  } catch (err) {
    console.error('Erreur get_game_by_id:', err.message);
    return { success: false, error: err.message };
  }
}

async function get_logs() {
  try {
    const sql = `SELECT * FROM Log ORDER BY Created_at DESC`;
    const [rows] = await pool.query(sql);
    return { success: true, logs: rows };
  } catch (err) {
    console.error('Erreur get_logs:', err.message);
    return { success: false, error: err.message };
  }
}




module.exports = {
  add_new_user,
  add_new_event,
  remove_event,
  join_event,
  get_recommendations,
  get_upcoming_events,
  get_user_event_history,
  get_stats,
  get_game_by_id,
  login_user,
  get_logs
};
