import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar"; // Import the Sidebar component

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${scheme}://${window.location.hostname}:${window.location.port}`;

        const newSocket = new WebSocket(url);
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        newSocket.onmessage = (event) => {
            const post = JSON.parse(event.data);
            setPosts((prevPosts) => [post, ...prevPosts]); // Add the new post to the top
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            newSocket.close();
        };
    }, []);

    const handlePost = (post) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(post));
            setPosts((prevPosts) => [post, ...prevPosts]); // Add the post to the sender's feed
        } else {
            console.error('WebSocket is not open');
        }
    };

    return (
        <>
            <div className="header">
                <a className="nav-button" href="/">Map</a>
                BeatBeacon
                <a className="nav-button" href="/feed">Feed</a>
            </div>
            <Sidebar onPost={handlePost} /> {/* Sidebar for posting */}
            <div className="feed">
                {posts.map((post, index) => (
                    <div key={index} className="post">
                        <h4>{post.username}</h4>
                        <p><strong>Song:</strong> {post.song}</p>
                        <p>{post.description}</p>
                        {post.location ? (
                            <p><strong>Location:</strong> {post.location.latitude}, {post.location.longitude}</p>
                        ) : (
                            <p>No location available</p>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Feed;
