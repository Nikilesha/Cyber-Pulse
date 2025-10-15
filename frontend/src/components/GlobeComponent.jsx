import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Globe from "globe.gl";
import countryData from "../assets/custom.geo2.json";

const GlobeComponent = () => {
  const globeRef = useRef();
  const defaultCameraPosition = useRef(null);
  const [cityData, setCityData] = useState([]);

  const MAX_ARCS = 10;       // max arcs at a time
  const ARC_HEIGHT = 0.35;  
  const ARC_INTERVAL = 100;  // ms between new arcs
  const CITY_COOLDOWN = 200; // ms before reusing cities
  const ARC_LIFESPAN = 3800;  // how long each arc fades out

  const activeArcsRef = useRef([]);
  const cooldownCityIdsRef = useRef([]);

  const COLOR_PALETTE = [
    ["#00ffff", "#ff00ff"],
    ["#ff0040", "#ffb3b3"],
    ["#00ff00", "#aaff00"],
    ["#ff9900", "#ffff00"],
    ["#0099ff", "#66ccff"],
    ["#ff00cc", "#cc00ff"],
    ["#00ffaa", "#00ffcc"],
  ];

  // Add stars
  const addStars = (scene, count = 3000, minDistance = 1500, maxDistance = 4000) => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * (maxDistance - minDistance) + minDistance;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 2 })));
  };

  // Fetch city data
  useEffect(() => {
    fetch("http://127.0.0.1:8000/cities")
      .then((res) => res.json())
      .then((data) => setCityData(data))
      .catch((err) => console.error(err));
  }, []);

  // Generate a new arc
  const generateArc = () => {
    const blockedIds = [
      ...cooldownCityIdsRef.current,
      ...activeArcsRef.current.flatMap((a) => [a.start.id, a.end.id]),
    ];
    const availableCities = cityData.filter((c) => !blockedIds.includes(c.id));
    if (availableCities.length < 2) return null;

    let start = availableCities[Math.floor(Math.random() * availableCities.length)];
    let end = availableCities[Math.floor(Math.random() * availableCities.length)];
    while (start.id === end.id) end = availableCities[Math.floor(Math.random() * availableCities.length)];

    // Cooldown cities
    cooldownCityIdsRef.current.push(start.id, end.id);
    setTimeout(() => {
      cooldownCityIdsRef.current = cooldownCityIdsRef.current.filter(id => id !== start.id && id !== end.id);
    }, CITY_COOLDOWN);

    const [startColor, endColor] = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const startColorRGBA = startColor + "80"; // 50% opacity
    const endColorRGBA = endColor + "80";

    const createdAt = Date.now(); // timestamp to handle fading

    return {
      start,
      end,
      createdAt,
      arcData: {
        startLat: start.latitude,
        startLng: start.longitude,
        endLat: end.latitude,
        endLng: end.longitude,
        color: [startColorRGBA, endColorRGBA],
        stroke: 0.7,
        height: ARC_HEIGHT,
        arcDashLength: 0.1,
        arcDashGap: 0,
        arcDashInitialGap: Math.random(),
        arcDashAnimateTime: 4000 + Math.random() * 2000,
      },
    };
  };

  // Initialize globe
  useEffect(() => {
    if (!globeRef.current || cityData.length === 0) return;

    const globe = Globe()(globeRef.current)
      .globeImageUrl(null)
      .globeMaterial(new THREE.MeshPhongMaterial({ color: "#0b1736", shininess: 0 }))
      .hexPolygonsData(countryData.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.25)
      .hexPolygonAltitude(0.002)
      .hexPolygonColor(d => {
        const value = Math.random();
        if (value < 0.25) return "#9be9a8";
        if (value < 0.5) return "#40c463";
        if (value < 0.75) return "#30a14e";
        return "#216e39";
      })
      .pointsData(cityData)
      .pointLat("latitude")
      .pointLng("longitude")
      .pointLabel(d => `${d.city_name}, ${d.country}`)
      .pointColor(() => "rgba(0,255,255,0.8)")
      .pointAltitude(() => 0.02)
      .arcColor("color")
      .arcAltitude("height")
      .arcStroke("stroke")
      .arcDashLength("arcDashLength")
      .arcDashGap("arcDashGap")
      .arcDashInitialGap("arcDashInitialGap")
      .arcDashAnimateTime("arcDashAnimateTime");

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.08;

    defaultCameraPosition.current = {
      position: globe.camera().position.clone(),
      target: globe.controls().target.clone(),
    };

    addStars(globe.scene());

    // Periodically add arcs
    const arcInterval = setInterval(() => {
      if (activeArcsRef.current.length >= MAX_ARCS) return;
      const newArc = generateArc();
      if (!newArc) return;

      activeArcsRef.current.push(newArc);
    }, ARC_INTERVAL);

    // Animate arcs for fading
    const animate = () => {
      const now = Date.now();
      // Remove arcs after lifespan and gradually fade
      activeArcsRef.current.forEach(a => {
        const age = now - a.createdAt;
        const opacity = Math.max(0, 1 - age / ARC_LIFESPAN);
        a.arcData.color = a.arcData.color.map(c => {
          if (c.startsWith("rgba")) {
            const rgba = c.split(",");
            rgba[3] = ` ${opacity})`;
            return rgba.join(",");
          } else if (c.startsWith("#")) {
            // convert hex to rgba with fading
            const hex = c.substring(1);
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r},${g},${b},${opacity})`;
          }
          return c;
        });
      });
      // Remove fully faded arcs
      activeArcsRef.current = activeArcsRef.current.filter(a => now - a.createdAt < ARC_LIFESPAN);
      globe.arcsData(activeArcsRef.current.map(a => a.arcData));
      requestAnimationFrame(animate);
    };
    animate();

    // Glow effect
    const glowInterval = setInterval(() => {
      globe.scene().traverse(obj => {
        if (obj.type === "Line" && obj.material) {
          obj.material.transparent = true;
          obj.material.depthWrite = false;
          obj.material.blending = THREE.AdditiveBlending;
          obj.material.toneMapped = false;
        }
      });
    }, 800);

    // Keyboard
    const handleKeyDown = (e) => {
      const controls = globe.controls();
      if (e.key.toLowerCase() === "p") controls.autoRotate = !controls.autoRotate;
      if (e.key.toLowerCase() === "r" && defaultCameraPosition.current) {
        const { position, target } = defaultCameraPosition.current;
        globe.camera().position.copy(position);
        controls.target.copy(target);
        controls.update();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Resize
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
      clearInterval(arcInterval);
      clearInterval(glowInterval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [cityData]);

  return (
    <div
      ref={globeRef}
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "500px",
        position: "relative",
        background: "radial-gradient(ellipse at bottom, #0b0c2a 0%, #000000 100%)",
      }}
    />
  );
};

export default GlobeComponent;
