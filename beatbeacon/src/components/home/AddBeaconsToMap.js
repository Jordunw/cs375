import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import BeaconInfoModal from './BeaconInfoModal';

const fetchSong = async (songId) => {
  try {
    const response = await fetch(`/api/songs/${songId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Song not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Here is the song data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
};

const AddBeaconsToMap = ({ beacons, map }) => {
  const mapRef = useRef(map);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [voteState, setVoteState] = useState({});
  const [userVotes, setUserVotes] = useState({});

  const getCurrentTimeframe = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const timeframe = minutes < 30 ? '00' : '30';
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${timeframe}`;
  };

  const loadUserVotesFromStorage = useCallback(() => {
    const storedVotes = localStorage.getItem('userVotes');
    if (storedVotes) {
      const parsedVotes = JSON.parse(storedVotes);
      const currentTimeframe = getCurrentTimeframe();
      
      // Filter out votes from previous timeframes
      const validVotes = Object.entries(parsedVotes).reduce((acc, [beaconId, vote]) => {
        if (vote.timeframe === currentTimeframe) {
          acc[beaconId] = vote.songId;
        }
        return acc;
      }, {});

      setUserVotes(validVotes);
    }
  }, []);

  const saveUserVotesToStorage = (newVotes) => {
    const currentTimeframe = getCurrentTimeframe();
    const votesToStore = Object.entries(newVotes).reduce((acc, [beaconId, songId]) => {
      acc[beaconId] = { songId, timeframe: currentTimeframe };
      return acc;
    }, {});
    localStorage.setItem('userVotes', JSON.stringify(votesToStore));
  };

  const resetVotes = useCallback(() => {
    console.log("Resetting votes and fetching new beacon data");
    setVoteState({});
    setUserVotes({});
    localStorage.removeItem('userVotes');
    // Here you would typically re-fetch the beacon data from your API
    // For now, we'll just reset to the initial state based on the current beacons prop
    if (beacons && beacons.length > 0) {
      const initialVoteState = {};
      beacons.forEach(beacon => {
        initialVoteState[beacon.id] = {};
        beacon.song_ids.forEach((songId, index) => {
          initialVoteState[beacon.id][songId] = beacon.vote_counts[index] || 0;
        });
      });
      setVoteState(initialVoteState);
    }
  }, [beacons]);

  useEffect(() => {
    loadUserVotesFromStorage();

    console.log("AddBeaconsToMap effect running");
    console.log("Current map reference:", mapRef.current);
    console.log("Beacons:", beacons);

    if (mapRef.current && beacons && beacons.length > 0) {
      beacons.forEach((beacon) => {
        const { location, beacon_name } = beacon;
        console.log("Processing beacon:", beacon_name, location);

        if (location && typeof location.x === 'number' && typeof location.y === 'number') {
          const latitude = location.x;
          const longitude = location.y;

          const customIcon = L.icon({
            iconUrl: 'icon2.png',
            iconSize: [64, 64],
            iconAnchor: [32, 64],
          });

          try {
            const marker = L.marker([latitude, longitude], {
              icon: customIcon,
              title: beacon_name,
            }).addTo(mapRef.current);

            // Add click event to open modal
            marker.on('click', async () => {
              try {
                const topSongs = await Promise.all(
                  beacon.song_ids.map(async (id, index) => {
                    try {
                      const songData = await fetchSong(id);
                      return {
                        id: id,
                        name: songData.music_name,
                        votes: beacon.vote_counts[index] || 0,
                        addedBy: songData.added_by_username
                      };
                    } catch (error) {
                      console.error(`Error fetching song ${id}:`, error);
                      return {
                        id: id,
                        name: `Unknown Song (ID: ${id})`,
                        votes: beacon.vote_counts[index] || 0,
                        addedBy: "unknown"
                      };
                    }
                  })
                );

                setSelectedBeacon({
                  ...beacon,
                  songName: beacon.beacon_name,
                  topSongs: topSongs
                });
                setIsModalOpen(true);
              } catch (error) {
                console.error("Error preparing beacon data:", error);
              }
            });

            console.log("Marker added for beacon:", beacon_name);
          } catch (error) {
            console.error("Error adding marker:", error);
          }
        } else {
          console.warn("Invalid location for beacon:", beacon_name);
        }
      });

      // Initialize vote state
      const initialVoteState = {};
      beacons.forEach(beacon => {
        initialVoteState[beacon.id] = {};
        beacon.song_ids.forEach((songId, index) => {
          initialVoteState[beacon.id][songId] = beacon.vote_counts[index] || 0;
        });
      });
      setVoteState(initialVoteState);
    } else {
      console.warn("Map reference or beacons array is not valid");
    }

    // Set up timer for vote reset
    const now = new Date();
    const minutes = now.getMinutes();
    const secondsUntilNextHalfHour = ((30 - (minutes % 30)) * 60 - now.getSeconds()) * 1000;

    const timer = setTimeout(() => {
      resetVotes();
      // Set up recurring timer every 30 minutes
      setInterval(resetVotes, 30 * 60 * 1000);
    }, secondsUntilNextHalfHour);

    return () => {
      clearTimeout(timer);
      clearInterval(timer);
    };
  }, [beacons, map, resetVotes, loadUserVotesFromStorage]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const increaseVote = async (beaconId, songId) => {
    try {
      const response = await fetch('/api/vote/increase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ beaconId, songId }),
      });

      if (!response.ok) {
        throw new Error('Failed to increase vote');
      }

      const data = await response.json();
      console.log('Vote increased successfully:', data);
      return data;
    } catch (error) {
      console.error('Error increasing vote:', error);
      throw error;
    }
  };

  const decreaseVote = async (beaconId, songId) => {
    try {
      const response = await fetch('/api/vote/decrease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ beaconId, songId }),
      });

      if (!response.ok) {
        throw new Error('Failed to decrease vote');
      }

      const data = await response.json();
      console.log('Vote decreased successfully:', data);
      return data;
    } catch (error) {
      console.error('Error decreasing vote:', error);
      throw error;
    }
  };

  const handleVote = async (beaconId, songId) => {
    try {
      const prevVote = userVotes[beaconId];
      
      if (prevVote && prevVote !== songId) {
        // Decrease vote for the previous song
        await decreaseVote(beaconId, prevVote);
      }
      
      // Increase vote for the new song
      const updatedBeacon = await increaseVote(beaconId, songId);
      
      // Update local state
      setVoteState(prevState => ({
        ...prevState,
        [beaconId]: updatedBeacon.vote_counts.reduce((acc, count, index) => {
          acc[updatedBeacon.song_ids[index]] = count;
          return acc;
        }, {})
      }));

      const newUserVotes = {
        ...userVotes,
        [beaconId]: songId
      };
      setUserVotes(newUserVotes);
      saveUserVotesToStorage(newUserVotes);

      console.log('Vote updated successfully. New vote state:', voteState);
      console.log('New user votes:', newUserVotes);
    } catch (error) {
      console.error('Error handling vote:', error);
      // You might want to show an error message to the user here
    }
  };

  const getVoteCount = (beaconId, songId) => {
    return voteState[beaconId]?.[songId] || 0;
  };

  const getUserVote = (beaconId) => {
    return userVotes[beaconId] || null;
  };

  return (
    <>
      <BeaconInfoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        beacon={selectedBeacon}
        onVote={handleVote}
        getVoteCount={getVoteCount}
        getUserVote={getUserVote}
      />
    </>
  );
};

export default AddBeaconsToMap;