import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/index.css";
import Sidebar from "./sidebar";

function MainPageContent() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Check if map already exists
    if (mapRef.current) return;

    // Creating map options
    const mapOptions = {
      center: [39.95659, -75.19548],
      zoom: 19,
    };

    // Creating a map object
    mapRef.current = L.map("map", mapOptions);

    // Creating a Layer object
    const layer = new L.TileLayer(
      "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );

    // Ask for current location and navigate to that area
    mapRef.current.locate({ setView: true, maxZoom: 16 });

    // Adding layer to the map
    mapRef.current.addLayer(layer);

    // Handle incoming WebSocket messages to add markers to the map
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

    // Cleanup map instance and WebSocket on component unmount
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
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const marker = L.marker([post.location.latitude, post.location.longitude], { icon: customIcon }).addTo(mapRef.current);
    marker.bindPopup(`<strong>${post.username}</strong><br>${post.song}<br>${post.description}`).openPopup();
  };

  const handlePost = (post) => {
    if (socket && socket.readyState === WebSocket.OPEN && location) {
      const postData = {
        ...post,
        location,
      };
      socket.send(JSON.stringify(postData));
      addMarkerToMap(postData); // Immediately add marker for the user's post
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

  // Automatically get location when component mounts
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
      <Sidebar onPost={handlePost} /> {/* Pass handlePost to Sidebar */}
      <div id="map"></div>
    </>
  );
}

export default MainPageContent;
