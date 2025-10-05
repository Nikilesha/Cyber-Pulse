import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import Globe from "globe.gl";
import countryData from "../assets/custom.geo2.json";

const GlobeComponent = () => {
  const globeRef = useRef();
  const globeInstance = useRef();
  const defaultCameraPosition = useRef(null);

  const addStars = (scene, count = 2000, minDistance = 1500, maxDistance = 4000) => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * (maxDistance - minDistance) + minDistance;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 5,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  };

  useEffect(() => {
    if (!globeRef.current) return;

    // Arcs data
    const arcsData = [
      {
        startLat: 28.6139,
        startLng: 77.209,
        endLat: 40.7128,
        endLng: -74.006,
        color: ["#ff0040", "#ffb3b3"], // gradient for glow
        size: 1.5,
        height: 0.35,
      },
      {
        startLat: 51.5074,
        startLng: -0.1278,
        endLat: 35.6895,
        endLng: 139.6917,
        color: ["#00ffcc", "#b3fff7"],
        size: 1.5,
        height: 0.35,
      },
    ];

    const globe = Globe()(globeRef.current)
      .globeImageUrl(null)
      .globeMaterial(new THREE.MeshPhongMaterial({ color: "#1D265C", shininess: 0 }))
      .arcsData(arcsData)
      .arcColor("color")
      .arcAltitude((d) => d.height)
      .arcStroke("size")
      .arcDashLength(() => 0.5)
      .arcDashGap(() => 0.1)
      .arcDashAnimateTime(() => 1000)
      .atmosphereColor("lightskyblue")
      .atmosphereAltitude(0.15)
      .hexPolygonsData(countryData.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.2)
      .hexPolygonAltitude(0.001)
      .hexPolygonColor((d) => {
        const value = d.properties.value ?? Math.random();
        if (value < 0.25) return "#9be9a8";
        if (value < 0.5) return "#40c463";
        if (value < 0.75) return "#30a14e";
        return "#216e39";
      });

    // Enable rotation
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.9;

    // Store default camera position
    defaultCameraPosition.current = {
      position: globe.camera().position.clone(),
      target: globe.controls().target.clone(),
    };

    // Add stars
    addStars(globe.scene());
    globeInstance.current = globe;

    // AFTER arcs are rendered, enhance glow
    setTimeout(() => {
      globe.scene().traverse((obj) => {
        if (obj.type === "Line" && obj.material) {
          obj.material.transparent = true;
          obj.material.opacity = 1;
          obj.material.depthWrite = false;
          obj.material.blending = THREE.AdditiveBlending; // glow
          obj.material.toneMapped = false; // prevents Three.js tone mapping from dulling color
        }
      });
    }, 500);

    // Key controls
    const handleKeyDown = (event) => {
      const controls = globe.controls();
      switch (event.key.toLowerCase()) {
        case "p":
          controls.autoRotate = !controls.autoRotate;
          break;
        case "r":
          if (defaultCameraPosition.current) {
            const { position, target } = defaultCameraPosition.current;
            globe.camera().position.copy(position);
            controls.target.copy(target);
            controls.update();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Responsive resize
    const handleResize = () => {
      const width = globeRef.current.clientWidth;
      const height = globeRef.current.clientHeight;
      globe.renderer().setSize(width, height);
      globe.camera().aspect = width / height;
      globe.camera().updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={globeRef}
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "500px",
        position: "relative",
      }}
    />
  );
};

export default GlobeComponent;
