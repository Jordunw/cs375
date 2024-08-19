import React, { useEffect, useState } from 'react';

const Feed = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Determine WebSocket scheme based on the current protocol
        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${scheme}://${window.location.hostname}:${window.location.port}`;

        const newSocket = new WebSocket(url);
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
            setMessages((prevMessages) => [...prevMessages, "Connected to WebSocket server"]);
        };

        newSocket.onmessage = (event) => {
            const message = event.data;
            setMessages((prevMessages) => [...prevMessages, `Got message: ${message}`]);
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setMessages((prevMessages) => [...prevMessages, "Disconnected from WebSocket server"]);
        };

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN && inputMessage) {
            console.log("Sending message to server:", inputMessage);
            socket.send(inputMessage);
            setMessages((prevMessages) => [...prevMessages, `You: ${inputMessage}`]);
            setInputMessage('');
        } else {
            console.error('WebSocket is not open or message is empty');
        }
    };

    return (
        <div>
            <h2>Live Feed</h2>
            <div className="message-feed">
                <ul>
                    {messages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            </div>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Feed;
