import React, { useEffect, useState } from 'react';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [username, setUsername] = useState('');
    const [song, setSong] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Determine WebSocket scheme based on the current protocol
        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${scheme}://${window.location.hostname}:${window.location.port}`;

        const newSocket = new WebSocket(url);
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        newSocket.onmessage = (event) => {
            const post = JSON.parse(event.data);
            setPosts((prevPosts) => [...prevPosts, post]);
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            newSocket.close();
        };
    }, []);

    const handlePost = () => {
        if (socket && socket.readyState === WebSocket.OPEN && username && song && description) {
            const post = {
                username,
                song,
                description,
                location, // Include the location directly obtained from the browser
            };

            console.log('Posting with data:', post); // Debugging output

            socket.send(JSON.stringify(post));
            setPosts((prevPosts) => [...prevPosts, post]); // Add the post to the sender's feed
            setUsername('');
            setSong('');
            setDescription('');
        } else {
            console.error('WebSocket is not open or fields are empty');
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            console.log('Geolocation is supported. Requesting location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    console.log('Location obtained:', loc); // Debugging output
                    setLocation(loc);
                },
                (error) => {
                    console.error('Error getting location:', error.message);
                    setLocation(null); // Fallback to null if location access is denied
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser');
            setLocation(null);
        }
    };

    // Automatically get location when component mounts
    useEffect(() => {
        getLocation();
    }, []);

    return (
        <div className="feed-page">
            <h2>Live Feed</h2>
            <div className="post-form">
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
        </div>
    );
};

export default Feed;