import React, { useEffect, useState } from "react";
import OAuth from "./oauth";
import * as Query from "../common/query";

export default function Sidebar({ onPost }) {
  const [loggedIn, setLoggedIn] = useState(OAuth.loggedIn());
  const [followedArtists, setFollowedArtists] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [song, setSong] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  const updateCurrentlyListeningTrack = async () => {
    let currentSong = await Query.currentListening(OAuth.getCurrentToken());
    console.log(currentSong);
    if (!currentSong || !currentSong.item || currentSong.item.type != "track")
      return;
    setSong({
      id: currentSong.item.id,
      img: currentSong.item.album.images[0].url,
      song: currentSong.item.name,
      artist: currentSong.item.artists[0].name, // just pulling the first artist name for simplicity
      duration: currentSong.item.duration_ms,
      progress: currentSong.progress_ms,
    });
  };

  useEffect(() => {
    if (loggedIn) {
      updateCurrentlyListeningTrack();
    }
  }, [loggedIn]);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
        },
        (error) => {
          console.error("Error getting location:", error.message);
          setLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setLocation(null);
    }
  };

  const handlePost = () => {
    if (username && song && description && location) {
      onPost({ username, song, description, location });
      setUsername("");
      setDescription("");
      const update = async () => await updateCurrentlyListeningTrack();
      update();
    } else {
      console.log(location);
      if (!song) console.error("You need to be listening to a song!");
      else console.error("All fields must be filled");
      return;
    }
  };

  const handleRefreshSong = () => {
    const update = async () => await updateCurrentlyListeningTrack();
    update();
  }

  const handleLoginClick = () => {
    OAuth.openPopupAndAuthenticate();
  };

  const handleLogoutClick = () => {
    OAuth.logout();
    setLoggedIn(false);
  };

  const testAPIQuery = async () => {
    setLoading(true);
    const token = OAuth.getCurrentToken().access_token;
    if (!token) return;
    const res = await Query.followedArtists(token);
    if (res && res.artists)
      setFollowedArtists(
        res.artists.items[Math.floor(Math.random() * 10)].name
      );
    setLoading(false);
  };

  return (
    <div className="sidebar" style={{ width: "300px", paddingBottom: "20px" }}>
      {!loggedIn ? (
        <a className="login-button" onClick={handleLoginClick}>
          Login with Spotify
        </a>
      ) : (
        <>
          <p>User is logged in</p>
          <a className="login-button" onClick={handleLogoutClick}>
            Log out
          </a>
          <div className="post-form" style={{ marginTop: "auto" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
            <p>Currently listening to: </p>
            {song ? (
              <span>
                <p>
                  <i>{song.song}</i>  by  <b>{song.artist}</b>
                </p>
              </span>
            ) : (
              <p>Nothing :/</p>
            )}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (max 200 characters)"
              maxLength={200}
            />
            <button onClick={handlePost}>Post</button>
            <br></br>
            <button onClick={handleRefreshSong}>Refresh song</button>
          </div>
        </>
      )}
    </div>
  );
}
