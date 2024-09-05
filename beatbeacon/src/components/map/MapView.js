import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerInfoModal from "./MarkerInfoModal";
import BeaconInfoModal from "./BeaconInfoModal";

const testBeacons = [
  {
    lat: 39.95259,
    lng: -75.16348,
    songName: "Philly Groove Beacon",
    topSongs: [
      { name: "Philadelphia Freedom by Elton John", votes: 120, addedBy: "phillyfan1" },
      { name: "Streets of Philadelphia by Bruce Springsteen", votes: 98, addedBy: "bossLover" },
      { name: "Motownphilly by Boyz II Men", votes: 87, addedBy: "r&bQueen" },
      { name: "Fall in Philadelphia by Hall & Oates", votes: 76, addedBy: "80sGuy" },
      { name: "Summertime by DJ Jazzy Jeff & The Fresh Prince", votes: 65, addedBy: "willSmithFan" }
    ]
  },
  {
    lat: 39.95859,
    lng: -75.17048,
    songName: "Liberty Bell Rock Beacon",
    topSongs: [
      { name: "Gonna Fly Now (Theme from Rocky) by Bill Conti", votes: 150, addedBy: "rockyFan" },
      { name: "Dancing in the Street by Martha and the Vandellas", votes: 130, addedBy: "motown4ever" },
      { name: "Sound of Philadelphia by MFSB", votes: 110, addedBy: "discoKing" },
      { name: "A Long Walk by Jill Scott", votes: 95, addedBy: "neoSoulSister" },
      { name: "I'm Gonna Make You Love Me by Diana Ross & The Supremes and The Temptations", votes: 85, addedBy: "supremesFan" }
    ]
  },
  {
    lat: 39.95159,
    lng: -75.14348,
    songName: "Schuylkill River Blues Beacon",
    topSongs: [
      { name: "Motown Philly by Boyz II Men", votes: 140, addedBy: "boyziimen4life" },
      { name: "Ready or Not by The Fugees", votes: 125, addedBy: "laurynhillfan" },
      { name: "You Got Me by The Roots", votes: 115, addedBy: "questlove" },
      { name: "Just the Two of Us by Grover Washington Jr. & Bill Withers", votes: 100, addedBy: "smoothjazz" },
      { name: "The Roots Is Comin' by The Roots", votes: 90, addedBy: "blackthought" }
    ]
  },
  {
    lat: 39.96059,
    lng: -75.15548,
    songName: "Cheesesteak Serenade Beacon",
    topSongs: [
      { name: "In The Street by The Orlons", votes: 110, addedBy: "60sRockFan" },
      { name: "Back Stabbers by The O'Jays", votes: 105, addedBy: "soulMusicLover" },
      { name: "Ain't No Stoppin' Us Now by McFadden & Whitehead", votes: 95, addedBy: "discoQueen" },
      { name: "For The Love of Money by The O'Jays", votes: 85, addedBy: "funkMaster" },
      { name: "Me and Mrs. Jones by Billy Paul", votes: 80, addedBy: "smoothOperator" }
    ]
  },
  {
    lat: 39.95459,
    lng: -75.18748,
    songName: "Art Museum Steps Beacon",
    topSongs: [
      { name: "Eye of the Tiger by Survivor", votes: 160, addedBy: "rockyBalboa" },
      { name: "Dirty Laundry by Don Henley", votes: 135, addedBy: "eaglesFan" },
      { name: "Expressway to Your Heart by The Soul Survivors", votes: 120, addedBy: "soulPatrol" },
      { name: "The Twist by Chubby Checker", votes: 110, addedBy: "danceKing" },
      { name: "I'll Be Around by The Spinners", votes: 100, addedBy: "r&bClassics" }
    ]
  }
];

function MapView({ userLocation, isAddingMarker }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);
  const [isBeaconModalOpen, setIsBeaconModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [selectedBeacon, setSelectedBeacon] = useState(null);

  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <path d="M12 0C7.58 0 3 4.58 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.42-4.58-9-9-9zm0 13a4 4 0 110-8 4 4 0 010 8z" fill="#ff5722"/>
        <circle cx="12" cy="9" r="3" fill="#fff"/>
      </svg>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });

  const beaconIcon = L.divIcon({
    className: 'beacon-div-icon',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
        <circle cx="12" cy="12" r="10" fill="#4CAF50" />
        <circle cx="12" cy="12" r="5" fill="#81C784" />
        <circle cx="12" cy="12" r="2" fill="#C8E6C9" />
      </svg>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });

  useEffect(() => {
    if (!mapRef.current) {
      const defaultLocation = [39.95659, -75.19548];
      const mapOptions = {
        center: userLocation || defaultLocation,
        zoom: 13,
        zoomControl: false,
      };

      mapRef.current = L.map(mapContainerRef.current, mapOptions);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        mapRef.current
      );

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      // Add test beacons
      testBeacons.forEach(beacon => {
        const newBeacon = L.marker([beacon.lat, beacon.lng], { icon: beaconIcon }).addTo(mapRef.current);
        newBeacon.on('click', () => {
          setSelectedBeacon(beacon);
          setIsBeaconModalOpen(true);
        });
      });
    }

    if (isAddingMarker) {
      mapRef.current.on('click', handleMapClick);
    } else {
      mapRef.current.off('click', handleMapClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [isAddingMarker, userLocation]);

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation]);

  const handleMapClick = (e) => {
    setTempLocation(e.latlng);
    setIsMarkerModalOpen(true);
  };

  const handleMarkerModalSubmit = (markerInfo) => {
    console.log("Marker info received:", markerInfo);
    if (tempLocation && markerInfo.songName && markerInfo.username) {
      const newMarker = L.marker(tempLocation, { icon: customIcon }).addTo(mapRef.current);
      
      // Create a popup with both song name and username
      newMarker.bindPopup(`
        <strong style="font-size: 16px;">${markerInfo.songName}</strong><br>
        <span style="font-size: 14px;">Added by: ${markerInfo.username}</span>
      `).openPopup();
      
      // Store the marker with its associated information
      setMarkers(prevMarkers => [
        ...prevMarkers,
        {
          leafletMarker: newMarker,
          songName: markerInfo.songName,
          username: markerInfo.username,
          location: tempLocation
        }
      ]);
      
      setTempLocation(null);
      setIsMarkerModalOpen(false);
    } else {
      console.log("Cannot add marker: missing location, song name, or username");
    }
  };

  return (
    <div style={{ position: "fixed", height: "100%", width: "100%", left: "300px", top: "60px" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      
      <MarkerInfoModal
        isOpen={isMarkerModalOpen}
        onClose={() => {
          setIsMarkerModalOpen(false);
        }}
        onSubmit={handleMarkerModalSubmit}
      />

      <BeaconInfoModal
        isOpen={isBeaconModalOpen}
        onClose={() => {
          setIsBeaconModalOpen(false);
        }}
        beacon={selectedBeacon}
      />
    </div>
  );
}

export default MapView;