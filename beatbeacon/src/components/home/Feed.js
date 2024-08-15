import React, { useEffect, useState } from 'react';

const Feed = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:3000');
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
            setMessages((prevMessages) => [...prevMessages, "Connected to WebSocket server"]);
        };

        newSocket.onmessage = (event) => {
            const reader = new FileReader();
            reader.onload = function() {
                const message = reader.result;
                setMessages((prevMessages) => [...prevMessages, `Got message: ${message}`]);
            };
            reader.readAsText(event.data); // Convert Blob to text
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
