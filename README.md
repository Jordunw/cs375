# BeatBeacon

BeatBeacon is a platform that integrates geolocation tracking with music streaming services to 
create a unique, interactive, and social experience for music enthusiasts. By using the Spotify API, BeatBeacon 
allows users to explore what others are listening to in real-time, connect with nearby friends, and 
engage with music-based points of interest.

To run app locally:

clone this repo
```
cd beatbeacon
```
add your local postgres user information to .env in the format:
```
PGUSER=postgres
PGPORT=5432
PGHOST=localhost
PGPASSWORD=CS375
PGDATABASE=beatbeacon
```
```
npm i
npm run setup:dev
npm run build
node WSServer.js
```

or visit production build at:
https://beatbeacon.fly.dev/

