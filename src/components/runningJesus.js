import React, { useEffect, useState, useMemo } from 'react';
import runningJesusGif from '../assets/runningJesus.gif';
import fishGif from '../assets/fish.gif'; // ⬅️ NEW: Import the fish GIF
import breadGif from '../assets/bread.gif'; // ⬅️ NEW: Import the bread GIF
import angel from '../assets/angel.png'; // ⬅️ NEW: Import the angel GIF
import MotherMary from '../assets/mothermary.png'; // ⬅️ NEW: Import the Mother Mary GIF

const ANIMATION_DURATION_MS = 3000;

// Array of available GIFs for easy expansion. 
// Just add new imports and objects to this list.
const GIF_ASSETS = [
  { src: runningJesusGif, alt: "Jesus Running" },
  { src: fishGif, alt: "Fish Swimming" },
    { src: breadGif, alt: "Bread Floating" },
    { src: angel, alt: "Angel Flying" },
    { src: MotherMary, alt: "Mother Mary" },
  // Future additions would go here:
  // { src: futureGif, alt: "Future Animation" },
];

// Helper function to generate a random string ID
const generateUniqueId = () => `run-${Math.random().toString(36).substring(2, 9)}`;

const RunningJesus = ({ onAnimationEnd }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // 1. Calculate random parameters AND select a random GIF once on mount
  const { 
    keyframeName, 
    animationParams, 
    selectedAsset 
  } = useMemo(() => {
    // Generate unique ID and name for keyframes
    const id = generateUniqueId();
    const name = `diagonal-run-${id}`;
    
    // Randomly select an asset from the list
    const asset = GIF_ASSETS[Math.floor(Math.random() * GIF_ASSETS.length)];

    // Calculate animation parameters
    // Generate a random vertical starting position (10% to 90% of screen height)
    const startY = Math.floor(Math.random() * 80) + 10; 
    
    // Determine the direction
    const direction = Math.random() > 0.5 ? 1 : 0; 
    
    // Set End Y based on direction
    const endY = direction === 1 
      ? Math.floor(Math.random() * 30) + 10 
      : Math.floor(Math.random() * 30) + 60;
      
    // Calculate the rotation angle to align the sprite with the path
    const deltaY = endY - startY;
    const angle = Math.atan2(deltaY, 100) * (180 / Math.PI);
    
    return { 
      keyframesId: id, 
      keyframeName: name, 
      animationParams: { startY, endY, angle }, 
      selectedAsset: asset 
    };
  }, []); // Dependencies are empty, ensuring calculation happens only once

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      onAnimationEnd();
    }, ANIMATION_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  // Define the dynamic keyframes using the unique name
  const dynamicKeyframes = `
    @keyframes ${keyframeName} {
      0% { 
        transform: translate(-100px, ${animationParams.startY}vh) rotate(${animationParams.angle}deg);
      } 
      100% { 
        transform: translate(100vw, ${animationParams.endY}vh) rotate(${animationParams.angle}deg);
      }
    }
  `;

  // Base style for the runner image
  const runnerStyle = {
    position: 'fixed',
    zIndex: 9999,
    width: '60px', 
    height: 'auto',
    opacity: isVisible ? 1 : 0, 
    animation: `${keyframeName} ${ANIMATION_DURATION_MS}ms linear forwards`,
  };

  return (
    <>
      {/* Inject the unique dynamic keyframes */}
      <style>{dynamicKeyframes}</style> 
      <img 
        src={selectedAsset.src} // ⬅️ UPDATED: Use randomly selected asset source
        alt={selectedAsset.alt} // ⬅️ UPDATED: Use descriptive alt text
        style={runnerStyle} 
      />
    </>
  );
};

export default RunningJesus;