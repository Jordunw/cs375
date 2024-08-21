DROP DATABASE IF EXISTS beatbeacon;
CREATE DATABASE beatbeacon;
\c beatbeacon

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- uuid for the user
    username VARCHAR(255) NOT NULL UNIQUE, -- username
    spotify_oauth TEXT, -- OAuth token
    date_created VARCHAR(255), -- date account was created
    marker_location POINT -- User last location (we can change it to radius)
);

CREATE TABLE songs (
    track_id VARCHAR(255) PRIMARY KEY, -- uuid for the song
    spotify_link VARCHAR(255) NOT NULL, -- link to the song on Spotify
    beacon_played_at VARCHAR(255), -- time the song was last played at a beacon
	song_added_at VARCHAR(255) -- time the song was added
);

CREATE TABLE playlists (
    playlist_id VARCHAR(255) PRIMARY KEY, -- uuid for the playlist
    spotify_playlist_link VARCHAR(255) NOT NULL, -- link to the playlist on Spotify
	nominations TEXT[] DEFAULT '{}', -- Array of nominated song IDs for the beacon
	songs TEXT[] DEFAULT '{}' -- Array of song IDs associated with playlist
);

CREATE TABLE beacons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- uuid for the beacon
    location POINT NOT NULL, -- location of the beacon (manual)
    beacon_playlist VARCHAR(255) -- beacon with associated playlist "playlist id"
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), --uuid for the post
    user_id UUID NOT NULL, -- user who created the post
    body TEXT NOT NULL, -- post
    location POINT, -- location where the post was created
    created_at VARCHAR(255), -- time the post was created
    likes_count INTEGER DEFAULT 0 --likes on the post
);

-- Create indexes for frequent queries
CREATE INDEX index_beacon_location ON beacons USING gist (location); -- indexed to improve speeds on grabbing locations, since we are using websockets
