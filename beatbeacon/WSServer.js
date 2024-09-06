require('dotenv').config(); 
const express = require("express");
const WebSocket = require("ws");
const path = require("path");
//const pg = require("pg");
let { Pool } = require("pg");
process.chdir(__dirname);
//console.log(process.env);


// Set up the database connection
//const env = require("./env.json");
//const Pool = pg.Pool;
//const pool = new Pool(env);

let port = 3000;
let host;
let databaseConfig;
// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
    host = "0.0.0.0";
    console.log(`Attempting to connect to ${process.env.DATABASE_URL}`);
    databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
    host = "localhost";
    let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
    databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

let pool = new Pool(databaseConfig);
pool.connect().then(() => {
  console.log(`Connected to database`);
}).catch(err => {
  console.error('Database connection error:', err);
});

// Set up the server
//const host = "0.0.0.0";
//const port = process.env.PORT || 3000;

const app = express();

// Parse JSON bodies
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// API routes
app.get('/api/posts', async (req, res, next) => {
    try {
        const query = `
            SELECT p.*
            FROM posts p
            ORDER BY p.created_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        next(error); // Pass errors to the error handling middleware
    }
});

app.get('/api/beacons', async (req, res, next) => {
    try {
        const query = `
            SELECT 
                *
            FROM beacons
            ORDER BY id;
        `;

        const result = await pool.query(query);

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/api/songs/:id', async (req, res, next) => {
    try {
        const songId = req.params.id;

        const query = `
            SELECT 
                id,
                spotify_link,
                added_by_username,
                music_name
            FROM songs
            WHERE id = $1;
        `;

        const result = await pool.query(query, [songId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Song not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.post('/api/vote/increase', async (req, res, next) => {
    try {
        const { beaconId, songId } = req.body;

        // First, get the current beacon data
        const getBeaconQuery = `
            SELECT song_ids, vote_counts
            FROM beacons
            WHERE id = $1;
        `;
        const beaconResult = await pool.query(getBeaconQuery, [beaconId]);

        if (beaconResult.rows.length === 0) {
            return res.status(404).json({ error: 'Beacon not found' });
        }

        const { song_ids, vote_counts } = beaconResult.rows[0];
        const songIndex = song_ids.indexOf(songId);

        if (songIndex === -1) {
            return res.status(404).json({ error: 'Song not found in this beacon' });
        }

        // Increase the vote count
        const newVoteCounts = [...vote_counts];
        newVoteCounts[songIndex] = (newVoteCounts[songIndex] || 0) + 1;

        // Update the beacon with the new vote count
        const updateQuery = `
            UPDATE beacons
            SET vote_counts = $1
            WHERE id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [newVoteCounts, beaconId]);

        res.json(updateResult.rows[0]);
    } catch (error) {
        next(error);
    }
});

// New endpoint to decrease vote
app.post('/api/vote/decrease', async (req, res, next) => {
    try {
        const { beaconId, songId } = req.body;

        // First, get the current beacon data
        const getBeaconQuery = `
            SELECT song_ids, vote_counts
            FROM beacons
            WHERE id = $1;
        `;
        const beaconResult = await pool.query(getBeaconQuery, [beaconId]);

        if (beaconResult.rows.length === 0) {
            return res.status(404).json({ error: 'Beacon not found' });
        }

        const { song_ids, vote_counts } = beaconResult.rows[0];
        const songIndex = song_ids.indexOf(songId);

        if (songIndex === -1) {
            return res.status(404).json({ error: 'Song not found in this beacon' });
        }

        // Decrease the vote count, but ensure it doesn't go below 0
        const newVoteCounts = [...vote_counts];
        newVoteCounts[songIndex] = Math.max((newVoteCounts[songIndex] || 0) - 1, 0);

        // Update the beacon with the new vote count
        const updateQuery = `
            UPDATE beacons
            SET vote_counts = $1
            WHERE id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [newVoteCounts, beaconId]);

        res.json(updateResult.rows[0]);
    } catch (error) {
        next(error);
    }
});


// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// Serve the React app for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the HTTP server
const httpServer = app.listen(port, host, () => {
  console.log(`Server is listening at http://${host}:${port}`);
});

// Set up the WebSocket server
const webSocketServer = new WebSocket.Server({ server: httpServer });

const { v4: uuidv4 } = require('uuid');

webSocketServer.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("message", async (data) => {
        const post = JSON.parse(data);
        console.log(`Received post from ${post.displayName}: ${post.song} - ${post.description}`);

        try {
            // Insert the post into the database
            const query = `
                INSERT INTO posts (id, display_name, body, location, created_at)
                VALUES ($1, $2, $3, point($4, $5), $6)
                RETURNING *;
            `;
            const values = [
                uuidv4(),
                post.displayName,
                JSON.stringify({ song: post.song, description: post.description }),
                post.location.longitude,
                post.location.latitude,
                new Date().toISOString()
            ];
            const result = await pool.query(query, values);
            const savedPost = result.rows[0];

            // Broadcast the saved post to all connected clients
            webSocketServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(savedPost));
                }
            });
        } catch (error) {
            console.error('Error saving post to database:', error);
            // Send error message back to the client
            socket.send(JSON.stringify({ error: error.message }));
        }
    });

    socket.on("close", () => {
        console.log("Socket disconnected");
    });
});