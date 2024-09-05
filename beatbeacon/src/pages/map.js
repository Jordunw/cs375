import React, { useState, useEffect } from "react";
import MapView from "../components/map/MapView";
import Sidebar from "../components/Sidebar";
import MapOverlay from "../components/map/MapOverlay";
import LocationService from "../services/LocationService";
import OAuth from "../services/OAuth";

function Map() {
    const [location, setLocation] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(OAuth.loggedIn());
    const [isAddingMarker, setIsAddingMarker] = useState(false);

    useEffect(() => {
        LocationService.getCurrentLocation()
            .then(setLocation)
            .catch(error => console.error("Error getting location:", error));
    }, []);

    const handleLoginStatusChange = (status) => {
        setIsLoggedIn(status);
    };

    const handleAddMarkerMode = (mode) => {
        setIsAddingMarker(mode);
    };

    const handleCancelAddMarker = () => {
        setIsAddingMarker(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
            <Sidebar 
                isLoggedIn={isLoggedIn} 
                onLoginStatusChange={handleLoginStatusChange}
                onAddMarkerMode={handleAddMarkerMode}
                isAddingMarker={isAddingMarker}
            />
            <div style={{ flexGrow: 1, marginLeft: '300px', marginTop: '60px', position: 'relative', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
                <MapView 
                    userLocation={location} 
                    isAddingMarker={isAddingMarker}
                />
                <MapOverlay 
                    isAddingMarker={isAddingMarker}
                    onCancel={handleCancelAddMarker}
                />
            </div>
        </div>
    );
}

export default Map;