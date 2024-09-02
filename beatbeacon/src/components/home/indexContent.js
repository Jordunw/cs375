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

    const textCoordinates = [
      post.location.latitude,
      post.location.longitude
    ];

    const textMarker = L.marker(textCoordinates, { icon: textIcon }).addTo(mapRef.current);

  };

  const addBeaconToMap = (title, songs, location) => {
    let latitude = location[0];
    let longitude = location[1];
    const customIcon = L.icon({
      iconUrl: "icon2.png",
      iconSize: [64, 64],
      iconAnchor: [32, 64],
      popupAnchor: [0, -64],
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current);

    
    const textIcon = L.divIcon({
      className: 'text-label',
      //html: `<div class="text-background"><strong>${post.username}</strong><br>${post.song}<br>${post.description}</div>`,
      iconSize: [150, 64],
      iconAnchor: [0, 0],
    });
    

    const textCoordinates = [
      latitude,
      longitude
    ];

    const textMarker = L.marker(textCoordinates, { icon: textIcon }).addTo(mapRef.current);

    const createPopupContent = () => {
      const container = document.createElement('div');
      container.style.maxHeight = '200px';
      container.style.overflowY = 'auto';
      container.style.width = '150px';
    
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Add a song...';
      input.style.width = '100%';
      container.appendChild(input);
    
      // Create a list element to display the songs
      const list = document.createElement('ul');
      list.style.padding = '0';
      list.style.margin = '10px 0';
      
      // Array to hold vote counts for each song
      const votes = songs.map(() => 0);
    
      // Function to update the list with current songs
      const updateList = () => {
        list.innerHTML = ''; // Clear current list
        songs.forEach((song, index) => {
          const listItem = document.createElement('li');
          listItem.style.listStyle = 'none'; // Remove bullet points
          listItem.style.display = 'flex'; // Use flexbox for alignment
          listItem.style.alignItems = 'center';
    
          // Add song text
          const songText = document.createElement('span');
          songText.textContent = song;
          listItem.appendChild(songText);
    
          // Add upvote button
          const upvoteButton = document.createElement('button');
          upvoteButton.textContent = '⬆️'; // Up arrow emoji
          upvoteButton.style.marginLeft = '5px';
          upvoteButton.addEventListener('click', () => {
            votes[index]++; // Increment vote count
            updateList(); // Refresh the list
          });
          listItem.appendChild(upvoteButton);
    
          // Add downvote button
          const downvoteButton = document.createElement('button');
          downvoteButton.textContent = '⬇️'; // Down arrow emoji
          downvoteButton.style.marginLeft = '5px';
          downvoteButton.addEventListener('click', () => {
            votes[index]--; // Decrement vote count
            updateList(); // Refresh the list
          });
          listItem.appendChild(downvoteButton);
    
          // Display current vote count
          const voteCount = document.createElement('span');
          voteCount.textContent = ` (${votes[index]})`;
          voteCount.style.marginLeft = '5px';
          listItem.appendChild(voteCount);
    
          list.appendChild(listItem);
        });
      };
    
      // Initial population of the list
      updateList();
      container.appendChild(list);
    
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
          songs.unshift(input.value.trim());
          votes.unshift(0); // Initialize vote count for the new song
          updateList(); // Update the list with the new song
          input.value = ''; // Clear the input field
        }
      });
    
      return container;
    };

    // Attach a click event to the marker to open the popup
    marker.on('click', () => {
      // Create popup content and bind it to the marker
      const popupContent = createPopupContent();
      marker.bindPopup(popupContent).openPopup();
    });
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
          console.error('Error getting   location:', error.message);
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
    addBeaconToMap("CCI", ["party rockers", "another song idk"], [39.95674100167317, -75.19514687333297]);
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
