DROP DATABASE IF EXISTS beatbeacon;
CREATE DATABASE beatbeacon;
\c beatbeacon

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- uuid for the user
    username VARCHAR(255) NOT NULL UNIQUE, -- username
    password VARCHAR(255) NOT NULL, -- Hashed password
    spotify_oauth TEXT, -- OAuth token
    date_created VARCHAR(255), -- date account was created
    marker_location POINT -- User last location (we can change it to radius)
);

CREATE TABLE songs (
    track_id VARCHAR(255) PRIMARY KEY, -- uuid for the song (from Spotify??)
    spotify_link VARCHAR(255) NOT NULL, -- link to the song on Spotify
    users_listened_to TEXT[] DEFAULT '{}', -- Array of user IDs who have listened to this song
    beacon_played_at VARCHAR(255), -- time the song was last played at a beacon
    playlist_id VARCHAR(255) -- playlist this song belongs to (can be null)
);

CREATE TABLE beacons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- uuid for the beacon
    location POINT NOT NULL, -- location of the beacon
    songs TEXT[] DEFAULT '{}' -- Array of song IDs connected to the beacon
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), --uuid for the post
    user_id UUID NOT NULL, -- user who created the post
    song_id VARCHAR(255) NOT NULL, -- song that belongs with the post
    body TEXT NOT NULL, -- post
    location POINT, -- location where the post was created
    created_at VARCHAR(255), -- time the post was created
    updated_at VARCHAR(255), -- time the post was last updated
    likes_count INTEGER DEFAULT 0, --likes on the post
    comments_count INTEGER DEFAULT 0 -- comments on the post
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- uuidfor the comment
    post_id UUID NOT NULL, -- post this comment belongs to
    user_id UUID NOT NULL, -- user who made the comment
    body TEXT NOT NULL, -- comment
    created_at VARCHAR(255), -- time the comment was created
    updated_at VARCHAR(255), -- time the comment was last updated
    likes_count INTEGER DEFAULT 0 -- likes on the comment
);

-- Create indexes for frequent queries
CREATE INDEX index_beacon_location ON beacons USING gist (location); -- indexed to improve speeds on grabbing locations, since we are using websockets

-- foreign key constraints for data integrity
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_user
FOREIGN KEY (user_id) 
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE posts 
ADD CONSTRAINT fk_posts_song
FOREIGN KEY (song_id) 
REFERENCES songs(track_id)
ON DELETE CASCADE;

ALTER TABLE comments
ADD CONSTRAINT fk_comments_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

ALTER TABLE comments
ADD CONSTRAINT fk_comments_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;