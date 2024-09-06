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