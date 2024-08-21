import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "../../styles/index.css";
import OAuth from "./oauth";
import * as Query from "../common/query";

export default function Sidebar() {
  const [loggedIn, setLoggedIn] = useState(OAuth.loggedIn());
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(false);

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
        const res = await Query.followedArtistsQuery(token);
        console.log(res);
        if(res)
            setFollowedArtists(res.artists.items); // Assuming res is an array of artists
        setLoading(false);
    };

  useEffect(() => {
    if (loggedIn) {
      testAPIQuery();
    }
  }, [loggedIn]);

  return (
    <div className="sidebar">
      {!loggedIn ? (
        <a className="login-button" onClick={handleLoginClick}>
          Login with Spotify
        </a>
      ) : (
        <>
          <p>User is logged in</p>
          <p>Random user followed artist:</p>
            {loading ? (
              <span>Loading...</span>
            ) : (
              <ul>
                {followedArtists.map((artist, index) => (
                  <li key={index}>{artist.name}</li>
                ))}
              </ul>
            )}
          <a className="login-button" onClick={handleLogoutClick}>
            Log out
          </a>
        </>
      )}
    </div>
  );
}
