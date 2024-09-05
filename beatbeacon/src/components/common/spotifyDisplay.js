import * as Query from "./query";
import React, { useState } from "react";
import OAuth from "../home/oauth";
import "../../styles/spotifyDisplay.css";

export function SearchResults({ song, artist = null, width, height }) {
  const [status, setStatus] = useState("searching");
  const [searchResults, setSearchResults] = useState(null);

  async function queryResults() {
    let results = undefined;
    let songArr = [];
    if (artist)
      results = await Query.searchSongByTitleAndArtist(
        OAuth.getCurrentToken(),
        song,
        artist,
        3
      );
    else
      results = await Query.searchSongByTitle(OAuth.getCurrentToken(), song, 3);

    if(!results || !results.items)
        return;

    results.items.forEach((item) => {
        songArr.push({
            id: item.id,
            img: item.album.images[0].url,
            song: item.name,
            artist: item.artists[0].name, // just pulling the first artist name for simplicity
            duration: item.duration_ms
        });
    });

    setSearchResults(songArr);
  }

  function drawSearchResult({ img, displayName, artistName, duration }) {
    return (
      <div className="songResult">
        <span>
          <div className="songImg">
            <img src={img} />
          </div>
          <div className="song-artist">
            <div className="song">{displayName}</div>
            <div className="artist">{artistName}</div>
          </div>
          <div className="duration">
            {duration / 60000}:{(duration % 60000) / 1000}
          </div>
        </span>
      </div>
    );
  }

  if (status === "searching") {
    return (
      <div className="searchDisplay" width={width} height={height}>
        <p className="loadingMessage">Searching...</p>
      </div>
    );
  }

  queryResults();

  return (
    <div className="searchDisplay" width={width} height={height}>
      {searchResults ? (
        <>
          <drawSearchResult
            img={searchResults[0].img}
            displayName={searchResults[0].song}
            artistName={searchResults[0].artist}
            duration={searchResults[0].duration}
          />
          <drawSearchResult
            img={searchResults[1].img}
            displayName={searchResults[1].song}
            artistName={searchResults[1].artist}
            duration={searchResults[1].duration}
          />
          <drawSearchResult
            img={searchResults[2].img}
            displayName={searchResults[2].song}
            artistName={searchResults[2].artist}
            duration={searchResults[2].duration}
          />
        </>
      ) : (
        <p className="loadingMessage">No results found.</p>
      )}
    </div>
  );
}
