import React, { useEffect, useState } from "react";
import OAuth from "./oauth";
import * as Query from "../common/query";

export default function Sidebar({ onPost }) {
    const [loggedIn, setLoggedIn] = useState(OAuth.loggedIn());
    const [followedArtists, setFollowedArtists] = useState([]);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [song, setSong] = useState('');
    const [description, setDescription] = useState('');

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
        if (res) setFollowedArtists(res.artists.items);
        setLoading(false);
    };

    useEffect(() => {
        if (loggedIn) {
            testAPIQuery();
        }
    }, [loggedIn]);

    const handlePost = () => {
        if (username && song && description) {
            onPost({ username, song, description });
            setUsername('');
            setSong('');
            setDescription('');
        } else {
            console.error('All fields must be filled');
        }
    };

    return (
        <div className="sidebar" style={{ width: '300px', paddingBottom: '20px' }}>
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

            <div className="post-form" style={{ marginTop: 'auto' }}>
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
        </div>
    );
}
