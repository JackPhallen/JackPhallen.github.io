import React, { useState, useEffect } from 'react';
import FloatingCharacters from '../components/FloatingCharacters';
import MenuOverlay from '../components/MenuOverlay';

// Simple debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

const HomePage = () => {
    // Track component key for resetting FloatingCharacters
    const [floatingCharKey, setFloatingCharKey] = useState(0);

    // Track current screen dimensions
    const [screenDimensions, setScreenDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Add resize handler with debounce
    useEffect(() => {
        // Function to handle resize completion
        const handleResizeComplete = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            // Calculate percentage change in dimensions
            const widthChange = Math.abs(newWidth - screenDimensions.width) / screenDimensions.width;
            const heightChange = Math.abs(newHeight - screenDimensions.height) / screenDimensions.height;

            // Only reset if change is significant (>15%)
            if (widthChange > 0.15 || heightChange > 0.15) {
                console.log('Significant resize detected, resetting FloatingCharacters');

                // Update stored dimensions
                setScreenDimensions({ width: newWidth, height: newHeight });

                // Force component reset by changing key
                setFloatingCharKey(prevKey => prevKey + 1);
            }
        };

        // Create debounced resize handler (waits 300ms after resize stops)
        const debouncedResizeHandler = debounce(handleResizeComplete, 300);

        // Add event listener
        window.addEventListener('resize', debouncedResizeHandler);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', debouncedResizeHandler);
        };
    }, [screenDimensions]); // Dependency on current dimensions

    return (
        <div className="home-page" style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000000'
        }}>
            {/* Floating Characters background with key for reset */}
            <FloatingCharacters key={floatingCharKey} />

            {/* Menu Overlay */}
            <MenuOverlay />
        </div>
    );
};

export default HomePage;