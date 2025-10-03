import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import Globe from "globe.gl";
import countryData from "../assets/custom.geo2.json"; // your downloaded GeoJSON

const GlobeComponent = () => {
  const globeRef = useRef();

  useEffect(() => {
    if (!globeRef.current) return; // make sure div is mounted

    // Arcs connecting cities
    const arcsData = [
      {
        startLat: 28.6139, // New Delhi
        startLng: 77.209,
        endLat: 40.7128, // New York
        endLng: -74.006,
        color: ["red", "blue"],
        size: 1,
        height: 0.25,
      },
      {
        startLat: 51.5074, // London
        startLng: -0.1278,
        endLat: 35.6895, // Tokyo
        endLng: 139.6917,
        color: ["green", "yellow"],
        size: 1,
        height: 0.25,
      },
    ];

    // Initialize the globe
    const globe = Globe()(globeRef.current)
      .globeImageUrl(null) // remove texture
      .globeMaterial(
        new THREE.MeshPhongMaterial({
          color: "#1D265C", // ocean color
          shininess: 0,
        })
      )
      .arcsData(arcsData)
      .arcColor("color")
      .arcAltitude((d) => d.height)
      .arcStroke("size")
      .arcDashLength(() => 0.5)
      .arcDashGap(() => 0.2)
      .arcDashAnimateTime(() => 2000)
      .atmosphereColor("lightskyblue")
      .atmosphereAltitude(0.1)

      // HEXAGON POLYGONS FROM GEOJSON
      .hexPolygonsData(countryData.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(1)
      .hexPolygonMargin(0.2)
      .hexPolygonAltitude(0.0010)
      .hexPolygonColor((d) => {
        const value = d.properties.value ?? Math.random(); // random if no property
        if (value < 0.25) return "#9be9a8"; // low
        if (value < 0.5) return "#40c463"; // medium
        if (value < 0.75) return "#30a14e"; // high
        return "#216e39"; // very high
      });

    // Auto-rotate globe
    
    globe.controls().autoRotateSpeed = 0.9;
  }, []);

  return <div ref={globeRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default GlobeComponent;
