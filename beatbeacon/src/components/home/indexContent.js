import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/index.css";
import Sidebar from "./sidebar";
import { fetchLocationDetails } from './geocodingUtils'; // Import the utility
import { searchSpotifySong } from "../common/songQuery";
import OAuth from "./oauth";

import NavBar from "../common/Navbar";

function MainPageContent() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [loggedIn, setLoggedIn] = useState(OAuth.loggedIn());
  const [token, setToken] = useState(OAuth.getCurrentToken());

  useEffect(() => {
    if (mapRef.current) return;

    const mapOptions = {
      center: [39.95659, -75.19548],
      zoom: 19,
    };

    mapRef.current = L.map("map", mapOptions);

    const layer = new L.TileLayer(
      "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );
    mapRef.current.locate({ setView: true, maxZoom: 16 });
    mapRef.current.addLayer(layer);

    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${scheme}://${window.location.hostname}:${window.location.port}`;
    const newSocket = new WebSocket(url);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    newSocket.onmessage = (event) => {
      const post = JSON.parse(event.data);
      if (mapRef.current && post.location) {
        addMarkerToMap(post);
      }
    };

    newSocket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    setLoggedIn(OAuth.loggedIn());
    setToken(OAuth.getCurrentToken());

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      newSocket.close();
    };
  }, [OAuth.loggedIn()]);

  const addMarkerToMap = (post) => {
    console.log("Function called with post:", post);
  
    if (!post || !post.location || !mapRef.current) {
      console.log("Missing required data: post, location, or mapRef.");
      return;
    }
  
    const { latitude, longitude } = post.location;
    console.log("Coordinates:", { latitude, longitude });
  
    const customIcon = L.icon({
      iconUrl: "icon.png",
      iconSize: [64, 64],
      iconAnchor: [32, 64],
      popupAnchor: [0, -64],
    });
  
    if (!mapRef.current) {
      console.log("Map reference is not defined.");
      return;
    }
  
    L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current);
  
    const textIcon = L.divIcon({
      className: "text-label",
      html: `<div class="text-background"><strong>${post.username}</strong><br>${post.song}<br>${post.description}</div>`,
      iconSize: [150, 64],
      iconAnchor: [0, 0],
    });
  
    const textCoordinates = [latitude, longitude];
  
    L.marker(textCoordinates, { icon: textIcon }).addTo(mapRef.current);
  };
  

  const DisplaySong = ({ song, onSelect }) => {
    if (!song) return <div />;
    return (
      <span>
        <p>
          {song.song} by {song.artist}
        </p>
        <button onClick={() => onSelect(song)}>Select</button>
      </span>
    );
  };

  const AddBeaconToMap = ({ title, songs, location, map }) => {
    useEffect(() => {
      if (mapRef.current) {
        const latitude = location[0];
        const longitude = location[1];

        const customIcon = L.icon({
          iconUrl: "icon2.png",
          iconSize: [64, 64],
          iconAnchor: [32, 64],
          popupAnchor: [0, -64],
        });

        const marker = L.marker([latitude, longitude], {
          icon: customIcon,
        }).addTo(mapRef.current);

        const popupContent = document.createElement("div");

        // Render React component into the container
        ReactDOM.render(<PopupContent songs={songs} />, popupContent);

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          marker.openPopup();
        });
      }
    }, [map, location, title, songs]);

    return null;
  };

  const PopupContent = ({ songs }) => {
    const [votes, setVotes] = useState(
      songs.map(() => ({
        song1Votes: 0,
        song2Votes: 0,
        isBattled: false,
        song2: null,
        timer: null,
      }))
    );
    const [inputValues, setInputValues] = useState(Array(songs.length).fill(""));
    const [foundSongs, setFoundSongs] = useState(null);
    const [countdown, setCountdown] = useState(null);
  
    const timerRefs = useRef([]);
  
    const handleInputChange = (value, index) => {
      const newInputValues = [...inputValues];
      newInputValues[index] = value;
      setInputValues(newInputValues);
    };
  
    const handleSearch = async (index) => {
      if (!token || !loggedIn) return null;
      const results = await searchSpotifySong(token, inputValues[index]);
      setFoundSongs(results);
    };
  
    const handleSelectSong = (index, song) => {
      setVotes((votes) =>
        votes.map((vote, i) => {
          if (i === index) {
            vote.song2 = song.song;
            vote.isBattled = true;
            vote.timer = 10;
          }
          return vote;
        })
      );
      setFoundSongs(null);
  
      if (timerRefs.current[index]) clearInterval(timerRefs.current[index]);
      startCountdown(index);
    };
  
    const handleVote = (index, isSong1) => {
      setVotes((votes) =>
        votes.map((vote, i) => {
          if (i === index) {
            if (isSong1) vote.song1Votes++;
            else vote.song2Votes++;
          }
          return vote;
        })
      );
    };
  
    const startCountdown = (index) => {
      timerRefs.current[index] = setInterval(() => {
        setVotes((votes) =>
          votes.map((vote, i) => {
            if (i === index && vote.timer > 0) {
              vote.timer--;
            }
            return vote;
          })
        );
      }, 1000);
  
      setTimeout(() => {
        endBattle(index);
        clearInterval(timerRefs.current[index]);
      }, 10000);  //TIMER LENGTH
    };
  
    const endBattle = (index) => {
      setVotes((votes) =>
        votes.map((vote, i) => {
          if (i === index) {
            if (vote.song2Votes > vote.song1Votes) {
              songs[i] = vote.song2;
            }
            vote.song1Votes = 0;
            vote.song2Votes = 0;
            vote.isBattled = false;
            vote.song2 = null;
          }
          return vote;
        })
      );
    };
  
    return (
      <div style={{ maxHeight: "200px", overflowY: "auto", width: "300px" }}>
        <ul style={{ padding: "0", margin: "10px 0" }}>
          {songs.map((song, index) => (
            <li
              key={index}
              style={{
                listStyle: "none",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span>{song}</span>
                {votes[index].isBattled ? (
                  <>
                    <div>
                      <button onClick={() => handleVote(index, true)}>
                        ↑ {votes[index].song1Votes}
                      </button>
                    </div>
                    <span>{votes[index].song2}</span>
                    <div>
                      <button onClick={() => handleVote(index, false)}>
                        ↑ {votes[index].song2Votes}
                      </button>
                    </div>
  
                    {/* Display Timer */}
                    <div>
                      <span>Time left: {votes[index].timer} seconds</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ margin: "10px 0" }}>
                      <input
                        type="text"
                        placeholder="Enter a song to battle..."
                        value={inputValues[index]}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index)
                        }
                      />
                      <button onClick={() => handleSearch(index)}>Search</button>
                    </div>
                    {foundSongs && (
                      <ul style={{ width: "100%", padding: "0" }}>
                        {foundSongs.map((foundSong, idx) => (
                          <li
                            key={idx}
                            style={{ listStyle: "none", padding: "5px 0" }}
                          >
                            <DisplaySong
                              song={foundSong}
                              onSelect={() => handleSelectSong(index, foundSong)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // const handlePost = async (post) => {
  //   if (socket && socket.readyState === WebSocket.OPEN && location) {
  //     const locationDetails = await fetchLocationDetails(
  //       location.latitude,
  //       location.longitude
  //     );
  //     const postData = {
  //       ...post,
  //       location,
  //       city: locationDetails.city,
  //       state: locationDetails.state,
  //       country: locationDetails.country,
  //     };
  //     socket.send(JSON.stringify(postData));
  //     addMarkerToMap(postData);
  //   } else {
  //     console.error("WebSocket is not open or location is not available");
  //   }
  // };

  const handlePost = async (post) => {
    if (post.location) {
        const locationDetails = await fetchLocationDetails(post.location.latitude, post.location.longitude);
        post.city = locationDetails.city;
        post.state = locationDetails.state;
        post.country = locationDetails.country;

        const postData = {
          ...post,
          location,
          city: locationDetails.city,
          state: locationDetails.state,
          country: locationDetails.country,
        };
        
        addMarkerToMap(postData);
    }

    // if (socket && socket.readyState === WebSocket.OPEN) {
    //     socket.send(JSON.stringify({
    //         ...post,
    //         displayName: displayName || "Anonymous User" // Use input display name or default to "Anonymous User"
    //     }));
    // } else {
    //     console.error('WebSocket is not open');
    // }
  };

  const fetchPosts = async () => {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Here is the data",data);
        return data;
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const markerObjects = await fetchPosts();
        
        for (const markerObject of markerObjects) {
          const song = markerObject.body.song;
          const description = markerObject.body.description;
          const displayName = markerObject.display_name;
          const location = markerObject.location;
  
          const markerData = {
            username: displayName,
            song: song,
            description: description,
            location: {
              longitude: location.x,
              latitude: location.y,
            },
          };
          
          addMarkerToMap(markerData);
        }
      } catch (error) {
        console.error('Error fetching marker data:', error);
      }
    };
  
    fetchData();
  }, []);  

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
          console.error("Error getting location:", error.message);
          setLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setLocation(null);
    }
  };

  useEffect(() => {
    getLocation();
    //addBeaconToMap("CCI", ["party rockers", "another song idk"], [39.95674100167317, -75.19514687333297]);
  }, []);

  const handleUsernameChange = (username) => {
      setDisplayName(username);
  };

  return (
    <>
      <NavBar />
      <Sidebar onPost={handlePost} onUsernameChange={handleUsernameChange} />
      <div id="map"></div>
      <AddBeaconToMap
        title={"CCI"}
        songs={["party rockers", "another song idk"]}
        location={[39.95674100167317, -75.19514687333297]}
        map={mapRef}
      />
    </>
  );
}

export default MainPageContent;
