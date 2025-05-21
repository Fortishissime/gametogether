const mysql = require('mysql2/promise');

require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});


const initDB = async () => {
    try {
        const connection = await pool.getConnection();


        // --------------------------------------
        // --- CONNEXION À LA BASE DE DONNÉES ---
        // --------------------------------------

        await connection.query(`
            CREATE DATABASE IF NOT EXISTS gametogether;
            USE gametogether;
        `);

        // ---------------------------
        // --- CRÉATION DES TABLES ---
        // ---------------------------

        await connection.query(`
            CREATE TABLE IF NOT EXISTS User (
            User_id INT PRIMARY KEY AUTO_INCREMENT,
            Username VARCHAR(50) NOT NULL UNIQUE,
            Email VARCHAR(50) NOT NULL UNIQUE,
            Password VARCHAR(255) NOT NULL,
            Register_date DATE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Game (
            Game_id INT PRIMARY KEY AUTO_INCREMENT,
            Game_name VARCHAR(50) NOT NULL,
            Description TEXT,
            Year_published INT,
            Playtime INT,
            Min_age INT,
            Min_players INT,
            Max_players INT,
            Cover VARCHAR(300)
            );

            CREATE TABLE IF NOT EXISTS Rating (
            Rating_id INT PRIMARY KEY AUTO_INCREMENT,
            Game_id INT NOT NULL,
            Average_rate DOUBLE,
            IdRank INT,
            FOREIGN KEY (Game_id) REFERENCES Game(Game_id)
            );

            CREATE TABLE IF NOT EXISTS Event (
            Event_id INT PRIMARY KEY AUTO_INCREMENT,
            Creator_id INT NOT NULL,
            Title VARCHAR(50) NOT NULL,
            Event_description TEXT,
            Event_date DATETIME NOT NULL,
            Event_location VARCHAR(250),
            Game_id INT,
            FOREIGN KEY (Creator_id) REFERENCES User(User_id),
            FOREIGN KEY (Game_id) REFERENCES Game(Game_id)
            );

            CREATE TABLE IF NOT EXISTS Participer (
            User_id INT NOT NULL,
            Event_id INT NOT NULL,
            PRIMARY KEY (User_id, Event_id),
            FOREIGN KEY (User_id) REFERENCES User(User_id),
            FOREIGN KEY (Event_id) REFERENCES Event(Event_id)
            );

            CREATE TABLE IF NOT EXISTS Log (
            Log_id INT AUTO_INCREMENT PRIMARY KEY,
            Log_message TEXT,
            Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("- Tables crées / chargées")

        // -------------------------
        // --- CRÉATION DES VUES ---
        // -------------------------

        await connection.query(`DROP VIEW IF EXISTS Upcoming_Events`);
        await connection.query(`
            CREATE VIEW Upcoming_Events AS
            SELECT  
                E.Event_id,
                E.Title,
                E.Event_description,
                E.Event_date, 
                E.Event_location, 
                G.Game_name, 
                U.Username AS Creator
            FROM Event E 
            JOIN Game G ON E.Game_id = G.Game_id 
            JOIN User U ON E.Creator_id = U.User_id 
            WHERE E.Event_date > NOW() 
            ORDER BY E.Event_date ASC;

        `);


        await connection.query(`DROP VIEW IF EXISTS Games_Stats`)
        await connection.query(`
            CREATE VIEW Games_Stats AS
            SELECT  
                G.Game_id, 
                G.Game_name, 
                R.Average_rate, 
                R.IdRank, 
                COUNT(E.Event_id) AS Event_Count
            FROM Game G
            LEFT JOIN Rating R ON G.Game_id = R.Game_id
            LEFT JOIN Event E ON G.Game_id = E.Game_id
            GROUP BY G.Game_id, G.Game_name, R.Average_rate, R.IdRank
            ORDER BY R.Average_rate DESC;
        `);


        await connection.query(`DROP VIEW IF EXISTS User_Event_History`)
        await connection.query(`
            CREATE VIEW User_Event_History AS
            SELECT  
                U.User_id, 
                U.Username, 
                E.Event_id, 
                E.Title, 
                E.Event_date, 
                E.Event_location, 
                CASE  
                    WHEN E.Creator_id = U.User_id THEN 'Creator' 
                    ELSE 'Participant' 
                END AS Role
            FROM User U
            JOIN (
                SELECT * FROM Event
                UNION
                SELECT E.*  
                FROM Event E  
                JOIN Participer P ON E.Event_id = P.Event_id
            ) AS E 
            ON E.Creator_id = U.User_id 
            OR EXISTS (
                SELECT 1 
                FROM Participer P 
                WHERE P.Event_id = E.Event_id 
                AND P.User_id = U.User_id
            )
            ORDER BY U.User_id, E.Event_date;
        `);

        console.log("- Vues initialisées / chargées")

        
        // -----------------------------
        // --- CRÉATION DES TRIGGERS ---
        // -----------------------------


        const [existingTriggers] = await connection.query(`
        SELECT TRIGGER_NAME FROM information_schema.triggers
        WHERE TRIGGER_SCHEMA = 'gametogether';
        `);

        const existingTriggerNames = existingTriggers.map(t => t.TRIGGER_NAME);

        if (!existingTriggerNames.includes('before_insert_event_date_check')) {
            await connection.query(`
                CREATE TRIGGER before_insert_event_date_check
                BEFORE INSERT ON Event
                FOR EACH ROW
                BEGIN
                    IF NEW.Event_date < NOW() THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'La date de l’événement ne peut pas être dans le passé.';
                    END IF;
                END;
            `);
            console.log("Trigger 'before_insert_event_date_check' créé.");
        }

        if (!existingTriggerNames.includes('after_user_insert_log')) {
            await connection.query(`
                CREATE TRIGGER after_user_insert_log
                AFTER INSERT ON User
                FOR EACH ROW
                BEGIN
                    INSERT INTO Log (Log_message)
                    VALUES (CONCAT('Nouvel utilisateur inscrit : ', NEW.Username, ' (ID : ', NEW.User_id, ')'));
                END;
            `);
            console.log("Trigger 'after_user_insert_log' créé.");
        }

        if (!existingTriggerNames.includes('after_event_insert_log')) {
            await connection.query(`
                CREATE TRIGGER after_event_insert_log
                AFTER INSERT ON Event
                FOR EACH ROW
                BEGIN
                    DECLARE creator_name VARCHAR(50);
                    SELECT Username INTO creator_name FROM User WHERE User_id = NEW.Creator_id;

                    INSERT INTO Log (Log_message)
                    VALUES (
                        CONCAT(
                            'Nouvel évènement créé par ', 
                            creator_name, 
                            ' : "', 
                            NEW.Title, 
                            '" (ID : ', 
                            NEW.Event_id, 
                            ')'
                        )
                    );
                END;
            `);
            console.log("Trigger 'after_event_insert_log' créé.");
        }

        if (!existingTriggerNames.includes('before_participation_limit_check')) {
            await connection.query(`
                CREATE TRIGGER before_participation_limit_check
                BEFORE INSERT ON Participer
                FOR EACH ROW
                BEGIN
                    DECLARE max_players INT;
                    DECLARE current_count INT;

                    SELECT g.Max_players INTO max_players
                    FROM Event e
                    JOIN Game g ON e.Game_id = g.Game_id
                    WHERE e.Event_id = NEW.Event_id;

                    SELECT COUNT(*) INTO current_count
                    FROM Participer
                    WHERE Event_id = NEW.Event_id;

                    IF current_count >= max_players THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Nombre maximal de participants atteint pour cet événement.';
                    END IF;
                END;
            `);
            console.log("Trigger 'before_participation_limit_check' créé.");
        }
        
        console.log("- Triggers initialisés / chargés")
        // -------------------------------
        // --- CRÉATION DES PROCÉDURES ---
        // -------------------------------

        const [existingProcedures] = await connection.query(`
        SELECT ROUTINE_NAME FROM information_schema.routines
        WHERE ROUTINE_SCHEMA = 'gametogether' AND ROUTINE_TYPE = 'PROCEDURE';
        `);

        const existingProcedureNames = existingProcedures.map(p => p.ROUTINE_NAME);

        if (!existingProcedureNames.includes('CreateEvent')) {
            await connection.query(`
                CREATE PROCEDURE CreateEvent (
                    IN p_creator_id INT,
                    IN p_title VARCHAR(50),
                    IN p_description TEXT,
                    IN p_event_date DATETIME,
                    IN p_event_location VARCHAR(250),
                    IN p_game_id INT
                )
                BEGIN
                    INSERT INTO Event (
                        Creator_id, Title, Event_description, Event_date, Event_location, Game_id
                    )
                    VALUES (
                        p_creator_id, p_title, p_description, p_event_date, p_event_location, p_game_id
                    );
                END;
            `);
            console.log("  - Procédure 'CreateEvent' créée.");
        }

        if (!existingProcedureNames.includes('JoinEvent')) {
            await connection.query(`
                CREATE PROCEDURE JoinEvent (
                    IN p_user_id INT,
                    IN p_event_id INT
                )
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM Participer WHERE User_id = p_user_id AND Event_id = p_event_id
                    ) THEN
                        INSERT INTO Participer (User_id, Event_id)
                        VALUES (p_user_id, p_event_id);
                    END IF;
                END;
            `);
            console.log("  - Procédure 'JoinEvent' créée.");
        }

        if (!existingProcedureNames.includes('GetRecommendedGames')) {
            await connection.query(`
                CREATE PROCEDURE GetRecommendedGames (
                    IN max_playtime INT,
                    IN user_age INT,
                    IN available_players INT
                )
                BEGIN
                    SELECT Game_id, Game_name, Description, Playtime, Min_players, Max_players, Min_age
                    FROM Game
                    WHERE
                        Playtime <= max_playtime
                        AND Min_age >= user_age
                        AND Min_players <= available_players
                        AND Max_players >= available_players
                    ORDER BY Game_id DESC;
                END;
            `);
            console.log("  - Procédure 'GetRecommendedGames' créée.");
        }

        console.log("- Procédures initialisés / chargés")

        // --------------------------
        // --- CRÉATION DES INDEX ---
        // --------------------------
         
        const [existingIndexes] = await connection.query(`
        SELECT INDEX_NAME, TABLE_NAME
        FROM information_schema.statistics
        WHERE TABLE_SCHEMA = 'gametogether';
        `);

        const indexExists = (name, table) =>
        existingIndexes.some(i => i.INDEX_NAME === name && i.TABLE_NAME === table);

        if (!indexExists('idx_event_date', 'event')) {
            await connection.query(`
                CREATE INDEX idx_event_date ON Event(Event_date);
            `);
            console.log("Index 'idx_event_date' créé.");
        }

        if (!indexExists('idx_game_filter', 'game')) {
            await connection.query(`
                CREATE INDEX idx_game_filter ON Game(Min_players, Playtime, Min_age);
            `);
            console.log("Index 'idx_game_filter' créé.");
        }

        if (!indexExists('idx_participer_user_event', 'participer')) {
            await connection.query(`
                CREATE INDEX idx_participer_user_event ON Participer(User_id, Event_id);
            `);
            console.log("Index 'idx_participer_user_event' créé.");
        }

        console.log("- Index initialisés / chargés\n")
        // ---------------------------------------------
        // --- Insertion des données Game et Ratings ---
        // ---------------------------------------------

        await populateGameIfEmpty();
        console.log("\n[OK] - Initialisation de la base de donnée terminée.")
        connection.release()

    } catch (error) {
        console.error('[!] - Erreur d\'initialisation de la base de données :', error);
    }


};




async function populateGameIfEmpty() {
/* 
    Fonction permettant de vérifier si la base est déjà peuplée ou non 
    Si elle ne l'est pas : on insère directement les données dans la base de données
*/ 
  const connection = await pool.getConnection();
  try {
    await connection.query('USE gametogether');

    const [rows] = await connection.query('SELECT COUNT(*) as count FROM Game');
    if (rows[0].count > 0) {
      console.log('[!] La table Game contient déjà des données. Aucun insert effectué.');
      return;
    }

    const { gameInserts, ratingInserts } = await require('./data/getData')

    if (gameInserts.length === 0) {
      console.log('Aucune requête INSERT INTO Game trouvée.');
      return;
    }

    console.log(`[+] Insertion de ${gameInserts.length} lignes dans la table Game... (Cette opération risque de prendre du temps)`);

    for (const query of gameInserts) {
      await connection.query(query);
    }

    console.log('[OK] - Insertion des données Game terminée.');
    console.log(`[+] - Insertion de ${ratingInserts.length} lignes dans la table Rating... (Cette opération risque de prendre du temps)`);

    for (const query of ratingInserts) {
      await connection.query(query);
    }

    console.log('[OK] - Insertion des données Rating terminée.')

  } catch (err) {
    console.error('[!] Erreur lors de l\'insertion des données Game:', err);
  } finally {
    connection.release();
  }
}

module.exports = {
    pool,
    initDB
}
