const express = require("express");
const WebSocket = require("ws");
const path = require("path");
const pg = require("pg");

// Set up the database connection
const env = require("./env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
}).catch(err => {
  console.error('Database connection error:', err);
});

// Set up the server
const host = "0.0.0.0";
const port = process.env.PORT || 3000;

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
        console.log(`Received post from ${post.username}: ${post.song} - ${post.description}`);

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