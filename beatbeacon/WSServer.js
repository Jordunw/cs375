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
if (process.env.NODE_ENV === "production") {
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

webSocketServer.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("message", (data) => {
        const post = JSON.parse(data);
        console.log(`Received post from ${post.username}: ${post.song} - ${post.description} located at: ${post.location.latitude}, ${post.location.longitude} / ${post.city}, ${post.state}, ${post.country}`);

        // Broadcast the post to all connected clients except the sender
        webSocketServer.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(post));
            }
        });
    });

    socket.on("close", () => {
        console.log("Socket disconnected");
    });
});