import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar"; // Import the Sidebar component
import { fetchLocationDetails } from './geocodingUtils'; // Import the utility

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [socket, setSocket] = useState(null);
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        // Fetch existing posts when component mounts
        fetchPosts();

        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${scheme}://${window.location.hostname}:${window.location.port}`;

        const newSocket = new WebSocket(url);
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        newSocket.onmessage = (event) => {
            const post = JSON.parse(event.data);
            setPosts((prevPosts) => [post, ...prevPosts]);
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            newSocket.close();
        };
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handlePost = async (post) => {
        if (post.location) {
            const locationDetails = await fetchLocationDetails(post.location.latitude, post.location.longitude);
            post.city = locationDetails.city;
            post.state = locationDetails.state;
            post.country = locationDetails.country;
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                ...post,
                displayName: displayName || "Anonymous User" // Use input display name or default to "Anonymous User"
            }));
        } else {
            console.error('WebSocket is not open');
        }
    };

    const handleUsernameChange = (username) => {
        setDisplayName(username);
    };

    return (
        <>
            <div className="header">
                <a className="nav-button" href="/">Map</a>
                BeatBeacon
                <a className="nav-button" href="/feed">Feed</a>
            </div>
            <Sidebar onPost={handlePost} onUsernameChange={handleUsernameChange} /> {/* Sidebar for posting */}
            <div className="feed">
                <h2>Live Feed:</h2>
                {posts.map((post, index) => (
                    <div key={index} className="post" style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{
                            color: '#007bff',
                            marginBottom: '10px',
                            fontSize: '1.2em'
                        }}>{post.display_name}</h4>
                        <p style={{
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            marginBottom: '10px'
                        }}>🎵 {post.body.song}</p>
                        <p style={{
                            fontStyle: 'italic',
                            color: '#6c757d',
                            marginBottom: '15px'
                        }}>{post.body.description}</p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.9em',
                            color: '#6c757d'
                        }}>
                            <span>{post.location ? `📍 (${post.location.x.toFixed(2)}, ${post.location.y.toFixed(2)})` : 'No location available'}</span>
                            <span>{new Date(post.created_at).toLocaleString()}</span>
                        </div>
                        {post.city || post.state || post.country ? (
                            <p style={{
                                marginTop: '10px',
                                fontSize: '0.9em',
                                color: '#6c757d'
                            }}>
                                🏙️ {[post.city, post.state, post.country].filter(Boolean).join(', ')}
                            </p>
                        ) : null}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Feed;
