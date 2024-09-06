import React, { useEffect, useState } from "react";
import OAuth from "./oauth";
import * as Query from "../common/query";

export default function Sidebar({ onPost, onUsernameChange }) {  // Add onUsernameChange prop
  const [loggedIn, setLoggedIn] = useState(OAuth.loggedIn());

  const [username, setUsername] = useState("");
  const [song, setSong] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  const updateCurrentlyListeningTrack = async () => {
    let currentSong = await Query.currentListening(OAuth.getCurrentToken());
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
    getLocation();
    if (loggedIn) {
      updateCurrentlyListeningTrack();
    }
  }, [OAuth.loggedIn()]);

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
      const songInfo = String(song.song) + " by " + String(song.artist);
      onPost({ username, song: songInfo, description, location });
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

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    onUsernameChange(newUsername);
  };

  return (
    <div 
  className="sidebar" 
  style={{ 
    width: "300px", 
    paddingBottom: "20px", 
    backgroundColor: "#ffebee", 
    color: "#b71c1c", 
    fontFamily: "Arial, sans-serif" 
  }}
>
  {!loggedIn ? (
    <a 
      className="login-button" 
      onClick={handleLoginClick} 
      style={{ 
        display: "inline-block", 
        padding: "10px 20px", 
        backgroundColor: "#d32f2f", 
        color: "#ffffff", 
        textDecoration: "none", 
        borderRadius: "5px", 
        cursor: "pointer" 
      }}
    >
      Login with Spotify
    </a>
  ) : (
    <>
      <p style={{ marginBottom: "10px" }}>User is logged in</p>
      <a 
        className="login-button" 
        onClick={handleLogoutClick} 
        style={{ 
          display: "inline-block", 
          padding: "10px 20px", 
          backgroundColor: "#d32f2f", 
          color: "#ffffff", 
          textDecoration: "none", 
          borderRadius: "5px", 
          cursor: "pointer" 
        }}
      >
        Log out
      </a>
      <div className="post-form" style={{ marginTop: "auto" }}>
        <p style={{ marginBottom: "5px" }}>Currently listening to: </p>
        {song ? (
          <span>
            <p>
              <i style={{ color: "#e57373" }}>{song.song}</i> by <b style={{ color: "#c62828" }}>{song.artist}</b>
            </p>
          </span>
        ) : (
          <p style={{ color: "#e57373" }}>Nothing :/</p>
        )}
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Enter username"
          style={{ 
            width: "100%", 
            padding: "5px", 
            marginBottom: "10px", 
            border: "1px solid #ef9a9a", 
            borderRadius: "3px" 
          }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description (max 200 characters)"
          maxLength={200}
          style={{ 
            width: "100%", 
            padding: "5px", 
            marginBottom: "10px", 
            border: "1px solid #ef9a9a", 
            borderRadius: "3px" 
          }}
        />
        <button 
          onClick={handlePost} 
          style={{ 
            padding: "5px 10px", 
            backgroundColor: "#c62828", 
            color: "#ffffff", 
            border: "none", 
            borderRadius: "3px", 
            cursor: "pointer", 
            marginRight: "5px" 
          }}
        >
          Post
        </button>
        <br />
        <button 
          onClick={handleRefreshSong} 
          style={{ 
            padding: "5px 10px", 
            backgroundColor: "#c62828", 
            color: "#ffffff", 
            border: "none", 
            borderRadius: "3px", 
            cursor: "pointer", 
            marginTop: "10px" 
          }}
        >
          Refresh song
        </button>
      </div>
    </>
  )}
</div>
  );
}
