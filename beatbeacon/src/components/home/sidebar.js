import React, { useEffect, useState } from "react";
import OAuth from "./oauth";
import * as Query from "../common/query";

export default function Sidebar({ onPost }) {
  const [loggedIn, setLoggedIn] = useState(OAuth.loggedIn());
  const [followedArtists, setFollowedArtists] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [song, setSong] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      testAPIQuery();
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
      setSong("");
      setDescription("");
    } else {
      console.error("All fields must be filled");
    }
  };

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
    if(!token) return;
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
            <input
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="Enter song name"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (max 200 characters)"
              maxLength={200}
            />
            <button onClick={handlePost}>Post</button>
          </div>
        </>
      )}
    </div>
  );
}
