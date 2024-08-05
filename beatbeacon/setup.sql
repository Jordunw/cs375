CREATE DATABASE beatbeacon;
\c beatbeacon
CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	body VARCHAR(25),
	song VARCHAR(25)
);
