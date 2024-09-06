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
    
        const createPopupContent = () => {
            const container = document.createElement('div');
            container.style.maxHeight = '200px';
            container.style.overflowY = 'auto';
            container.style.width = '300px';
    
            const list = document.createElement('ul');
            list.style.padding = '0';
            list.style.margin = '10px 0';
    
            const votes = songs.map(() => ({ song1Votes: 0, song2Votes: 0, isBattled: false, song2: null }));
    
            const updateList = () => {
                list.innerHTML = '';
                songs.forEach((song, index) => {
                    const listItem = document.createElement('li');
                    listItem.style.listStyle = 'none';
                    listItem.style.display = 'flex';
                    listItem.style.alignItems = 'center';
                    listItem.style.flexDirection = 'column';
    
                    const songContainer = document.createElement('div');
                    songContainer.style.display = 'flex';
                    songContainer.style.alignItems = 'center';
                    songContainer.style.justifyContent = 'space-between';
                    songContainer.style.width = '100%';
    
                    const songText = document.createElement('span');
                    songText.textContent = song;
                    songContainer.appendChild(songText);
    
                    // If there's no battle yet, show the battle button
                    if (!votes[index].isBattled) {
                        const battleButton = document.createElement('button');
                        battleButton.textContent = 'Battle';
                        battleButton.style.marginLeft = '5px';
                        battleButton.addEventListener('click', () => {
                            showBattleInput(index);
                        });
                        songContainer.appendChild(battleButton);
                    } else {
                        // If a battle has started, show both songs with upvote buttons
                        const song2Text = document.createElement('span');
                        song2Text.textContent = votes[index].song2;
                        songContainer.appendChild(song2Text);
    
                        const upvoteSong1Button = document.createElement('button');
                        upvoteSong1Button.textContent = `⬆️ ${votes[index].song1Votes}`;
                        upvoteSong1Button.style.marginLeft = '5px';
                        upvoteSong1Button.addEventListener('click', (e) => {
                            e.stopPropagation();
                            votes[index].song1Votes++;
                            updateList();
                        });
                        songContainer.appendChild(upvoteSong1Button);
    
                        const upvoteSong2Button = document.createElement('button');
                        upvoteSong2Button.textContent = `⬆️ ${votes[index].song2Votes}`;
                        upvoteSong2Button.style.marginLeft = '5px';
                        upvoteSong2Button.addEventListener('click', (e) => {
                            e.stopPropagation();
                            votes[index].song2Votes++;
                            updateList();
                        });
                        songContainer.appendChild(upvoteSong2Button);
                    }
    
                    listItem.appendChild(songContainer);
                    list.appendChild(listItem);
                });
            };
    
            // Function to show battle input
            const showBattleInput = (songIndex) => {
                const inputContainer = document.createElement('div');
                inputContainer.style.display = 'flex';
                inputContainer.style.marginTop = '5px';
    
                const battleInput = document.createElement('input');
                battleInput.type = 'text';
                battleInput.placeholder = 'Add a song to battle...';
                battleInput.style.flex = '1';
    
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';
                submitButton.style.marginLeft = '5px';
                submitButton.addEventListener('click', () => {
                    if (battleInput.value.trim() !== '') {
                        votes[songIndex].song2 = battleInput.value.trim();
                        votes[songIndex].isBattled = true;
                        updateList();
                    }
                });
    
                inputContainer.appendChild(battleInput);
                inputContainer.appendChild(submitButton);
    
                // Add input box below the battled song
                list.children[songIndex].appendChild(inputContainer);
            };
    
            // Initial list update
            updateList();
    
            container.appendChild(list);
            return container;
        };
    
        const popupContent = createPopupContent();
        marker.bindPopup(popupContent);
    
        marker.on('click', () => {
            marker.openPopup();
        });
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
        addBeaconToMap("CCI", ["party rockers", "another song idk"], [39.95674100167317, -75.19514687333297]);
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
