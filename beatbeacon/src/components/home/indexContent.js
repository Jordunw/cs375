import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/index.css";
import Sidebar from "./sidebar";

function MainPageContent() {
  // reference to map instance
  const mapRef = useRef(null);

  useEffect(() => {
    // check if map already exists
    if (mapRef.current) return;

    // Creating map options
    var mapOptions = {
      center: [39.95659, -75.19548],
      zoom: 19,
    };

    // Creating a map object
    mapRef.current = L.map("map", mapOptions);

    // Creating a Layer object
    var layer = new L.TileLayer(
      "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );

    // Ask for current location and navigate to that area
    mapRef.current.locate({ setView: true, maxZoom: 16 });

    // Adding layer to the map
    mapRef.current.addLayer(layer);

    //messing around with markers
    const customIcon = L.icon({
      iconUrl: "icon.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const marker = L.marker([39.95659, -75.19548], { icon: customIcon }).addTo(
      mapRef.current
    );
    marker.bindPopup("CCI").openPopup();

    mapRef.current.on("locationfound", function (e) {
      var currentloc = L.marker(e.latlng, { icon: customIcon }).addTo(
        mapRef.current
      );
      currentloc.bindPopup("current loc").openPopup();
    });

    // Cleanup map instance
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="header">BeatBeacon</div>
      <Sidebar />
      <div id="map"></div>
    </>
  );
}

export default MainPageContent;
