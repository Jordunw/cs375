
const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";


const env = require("/Users/chrisfluta/Documents/GitHub/cs375/beatbeacon/env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});

