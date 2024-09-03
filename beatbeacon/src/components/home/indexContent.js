import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/index.css";
import Sidebar from "./sidebar";
import { fetchLocationDetails } from './geocodingUtils'; // Import the utility

function MainPageContent() {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (mapRef.current) return;

        const mapOptions = {
            center: [39.95659, -75.19548],
            zoom: 19,
        };

        mapRef.current = L.map("map", mapOptions);

        const layer = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
        mapRef.current.locate({ setView: true, maxZoom: 16 });
        mapRef.current.addLayer(layer);

        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${scheme}://${window.location.hostname}:${window.location.port}`;
        const newSocket = new WebSocket(url);
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        newSocket.onmessage = (event) => {
            const post = JSON.parse(event.data);
            if (mapRef.current && post.location) {
                addMarkerToMap(post);
            }
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            newSocket.close();
        };
    }, []);

    const addMarkerToMap = (post) => {
        const customIcon = L.icon({
            iconUrl: "icon.png",
            iconSize: [64, 64],
            iconAnchor: [32, 64],
            popupAnchor: [0, -64],
        });

        const marker = L.marker([post.location.latitude, post.location.longitude], { icon: customIcon }).addTo(mapRef.current);

        const textIcon = L.divIcon({
            className: 'text-label',
            html: `<div class="text-background"><strong>${post.username}</strong><br>${post.song}<br>${post.description}</div>`,
            iconSize: [150, 64],
            iconAnchor: [0, 0],
        });

        const textCoordinates = [post.location.latitude, post.location.longitude];

        L.marker(textCoordinates, { icon: textIcon }).addTo(mapRef.current);
    };

    const handlePost = async (post) => {
        if (socket && socket.readyState === WebSocket.OPEN && location) {
            const locationDetails = await fetchLocationDetails(location.latitude, location.longitude);
            const postData = {
                ...post,
                location,
                city: locationDetails.city,
                state: locationDetails.state,
                country: locationDetails.country,
            };
            socket.send(JSON.stringify(postData));
            addMarkerToMap(postData);
        } else {
            console.error('WebSocket is not open or location is not available');
        }
    };

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
                    console.error('Error getting location:', error.message);
                    setLocation(null);
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

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <>
            <div className="header">
                <a className="nav-button" href="/">Map</a>
                BeatBeacon
                <a className="nav-button" href="/feed">Feed</a>
            </div>
            <Sidebar onPost={handlePost} />
            <div id="map"></div>
        </>
    );
}

export default MainPageContent;
