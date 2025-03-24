import React, { useState, useEffect, useRef } from 'react';
import FloatingCharacters from '../components/FloatingCharacters';
import MenuOverlay from '../components/MenuOverlay';
import TerminalIcon from '../components/TerminalIcon';

// Simple debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

const HomePage = () => {
    // Unique ID for FloatingCharacters component so that we can destroy and recreate on resize
    const [floatingCharKey, setFloatingCharKey] = useState(0);

    // Track current screen dimensions
    const [screenDimensions, setScreenDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Need enough space to allow playing with characters
    const [isMenuVisible, setIsMenuVisible] = useState(true);

    // Reference to menu width (default menu width is 340px based on MenuOverlay.jsx)
    const MENU_WIDTH = 340;
    const MINIMUM_PADDING = 20; // Space for playing with characters

    // Check if screen is narrow on initial load and set menu visibility accordingly
    useEffect(() => {
        const isNarrowScreen = window.innerWidth < (MENU_WIDTH + MINIMUM_PADDING * 2);
        // If screen is narrow, hide menu by default
        if (isNarrowScreen) {
            setIsMenuVisible(false);
        }
    }, []);

    // Handle resizing with debounce
    useEffect(() => {
        const handleResizeComplete = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            // Only reset if change is significant (>15%)
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
        window.addEventListener('resize', debouncedResizeHandler);
        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', debouncedResizeHandler);
        };
    }, [screenDimensions]); // Dependency on current dimensions

    // Toggle menu visibility
    const toggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    return (
        <div className="home-page" style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000000'
        }}>
            {/* Floating Characters background - shown on all devices */}
            <FloatingCharacters key={floatingCharKey} />

            {/* Hamburger menu button - only visible when menu is hidden */}
            {!isMenuVisible && <TerminalIcon onClick={toggleMenu} />}

            {/* Menu Overlay - shown when isMenuVisible is true */}
            {isMenuVisible && <MenuOverlay onClose={toggleMenu} />}
        </div>
    );
};

export default HomePage;