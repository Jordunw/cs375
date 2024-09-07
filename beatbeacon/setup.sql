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

-- CREATE TABLE songs (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- uuid for each song
--     spotify_link VARCHAR(255) NOT NULL,           -- link to the song on Spotify
--     added_by_username VARCHAR(255) NOT NULL,      -- username of the person who added the song
--     music_name VARCHAR(255) NOT NULL              -- name of the music/song
-- );

-- CREATE TABLE playlists (
--     playlist_id VARCHAR(255) PRIMARY KEY, -- uuid for the playlist
--     spotify_playlist_link VARCHAR(255) NOT NULL, -- link to the playlist on Spotify
-- 	nominations TEXT[] DEFAULT '{}', -- Array of nominated song IDs for the beacon
-- 	songs TEXT[] DEFAULT '{}' -- Array of song IDs associated with playlist
-- );

-- Create the songs table
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotify_link VARCHAR(255) NOT NULL,
    added_by_username VARCHAR(255) NOT NULL,
    music_name VARCHAR(255) NOT NULL
);

-- Create the beacons table
CREATE TABLE beacons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location POINT NOT NULL,
    song_ids UUID[] DEFAULT '{}',
    beacon_name VARCHAR(255),
    previous_winner UUID,
    vote_counts INTEGER[] DEFAULT '{}'
);

ALTER TABLE beacons
ADD CONSTRAINT check_vote_counts_length
CHECK (array_length(vote_counts, 1) = array_length(song_ids, 1));

-- Insert test data
INSERT INTO songs (spotify_link, added_by_username, music_name)
VALUES
    ('https://open.spotify.com/track/1', 'user1', 'Song One'),
    ('https://open.spotify.com/track/2', 'user2', 'Song Two'),
    ('https://open.spotify.com/track/3', 'user3', 'Song Three'),
    ('https://open.spotify.com/track/4', 'user1', 'Song Four'),
    ('https://open.spotify.com/track/5', 'user2', 'Song Five'),
    ('https://open.spotify.com/track/6', 'user3', 'Song Six'),
    ('https://open.spotify.com/track/7', 'user1', 'Song Seven'),
    ('https://open.spotify.com/track/8', 'user2', 'Song Eight'),
    ('https://open.spotify.com/track/9', 'user3', 'Song Nine'),
    ('https://open.spotify.com/track/10', 'user1', 'Song Ten');

WITH song_ids AS (
    SELECT id FROM songs ORDER BY music_name
)
INSERT INTO beacons (location, song_ids, beacon_name, previous_winner, vote_counts)
VALUES
    (POINT(39.9544, -75.1899), 
     ARRAY[(SELECT id FROM song_ids LIMIT 1 OFFSET 0), (SELECT id FROM song_ids LIMIT 1 OFFSET 1), (SELECT id FROM song_ids LIMIT 1 OFFSET 2), (SELECT id FROM song_ids LIMIT 1 OFFSET 3), (SELECT id FROM song_ids LIMIT 1 OFFSET 4)], 
     'Main Building', 
     (SELECT id FROM song_ids LIMIT 1 OFFSET 0), 
     ARRAY[50, 40, 30, 20, 10]),

    (POINT(39.9538, -75.1903), 
     ARRAY[(SELECT id FROM song_ids LIMIT 1 OFFSET 2), (SELECT id FROM song_ids LIMIT 1 OFFSET 3), (SELECT id FROM song_ids LIMIT 1 OFFSET 4), (SELECT id FROM song_ids LIMIT 1 OFFSET 5), (SELECT id FROM song_ids LIMIT 1 OFFSET 6), (SELECT id FROM song_ids LIMIT 1 OFFSET 7)], 
     'Gerri C. LeBow Hall', 
     (SELECT id FROM song_ids LIMIT 1 OFFSET 2), 
     ARRAY[60, 50, 40, 30, 20, 10]),

    (POINT(39.9555, -75.1892), 
     ARRAY[(SELECT id FROM song_ids LIMIT 1 OFFSET 3), (SELECT id FROM song_ids LIMIT 1 OFFSET 4), (SELECT id FROM song_ids LIMIT 1 OFFSET 5), (SELECT id FROM song_ids LIMIT 1 OFFSET 6), (SELECT id FROM song_ids LIMIT 1 OFFSET 7), (SELECT id FROM song_ids LIMIT 1 OFFSET 8), (SELECT id FROM song_ids LIMIT 1 OFFSET 9)], 
     'Mario Statue', 
     (SELECT id FROM song_ids LIMIT 1 OFFSET 3), 
     ARRAY[70, 60, 50, 40, 30, 20, 10]),

    (POINT(39.9531, -75.1860), 
     ARRAY[(SELECT id FROM song_ids LIMIT 1 OFFSET 1), (SELECT id FROM song_ids LIMIT 1 OFFSET 4), (SELECT id FROM song_ids LIMIT 1 OFFSET 7), (SELECT id FROM song_ids LIMIT 1 OFFSET 9)], 
     'Papadakis Integrated Sciences Building', 
     (SELECT id FROM song_ids LIMIT 1 OFFSET 1), 
     ARRAY[40, 30, 20, 10]),

    (POINT(39.9552, -75.1944), 
     ARRAY[(SELECT id FROM song_ids LIMIT 1 OFFSET 0), (SELECT id FROM song_ids LIMIT 1 OFFSET 2), (SELECT id FROM song_ids LIMIT 1 OFFSET 4), (SELECT id FROM song_ids LIMIT 1 OFFSET 6), (SELECT id FROM song_ids LIMIT 1 OFFSET 8)], 
     'Drexel Park', 
     (SELECT id FROM song_ids LIMIT 1 OFFSET 4), 
     ARRAY[50, 40, 30, 20, 10]);



CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    body JSONB NOT NULL, -- Store song and description as JSON
    location POINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0
);

-- Create indexes for frequent queries
CREATE INDEX index_beacon_location ON beacons USING gist (location); -- indexed to improve speeds on grabbing locations, since we are using websockets
