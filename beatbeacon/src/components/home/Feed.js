import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar"; // Import the Sidebar component
import { fetchLocationDetails } from './geocodingUtils'; // Import the utility
import NavBar from "../common/Navbar";

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
            <NavBar />
            <Sidebar onPost={handlePost} onUsernameChange={handleUsernameChange} /> {/* Sidebar for posting */}
            <div className="feed">
                <h2>Live Feed:</h2>
                {posts.map((post, index) => (
                    <div key={index} className="post">
                        <h4>{post.display_name}</h4>
                        <p><strong>Song:</strong> {post.body.song}</p>
                        <p><strong>Description:</strong> {post.body.description}</p>
                        <p><strong>Location:</strong> {post.location ? `(${post.location.x}, ${post.location.y})` : 'No location available'}</p>
                        <p><strong>Created at:</strong> {new Date(post.created_at).toLocaleString()}</p>
                        {post.city || post.state || post.country ? (
                            <p><strong>Address:</strong> 
                                {[post.city, post.state, post.country].filter(Boolean).join(', ')}
                            </p>
                        ) : null}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Feed;
