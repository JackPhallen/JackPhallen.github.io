import React, { useState, useEffect, useRef } from 'react';
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
    // Unique ID for FloatingCharacters component so that we can destroy and recreate on resize
    const [floatingCharKey, setFloatingCharKey] = useState(0);

    // Track current screen dimensions
    const [screenDimensions, setScreenDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Need enough space to allow playing with characters
    const [isTooNarrow, setIsTooNarrow] = useState(false);
    const MENU_WIDTH = 340;
    const MINIMUM_PADDING = 20;  // Space for playing with characters

    // Check if screen is too narrow on initial load
    useEffect(() => {
        const checkWidth = () => {
            setIsTooNarrow(window.innerWidth < (MENU_WIDTH + MINIMUM_PADDING * 2));
        };

        checkWidth();
    }, []);

    // Handle resizing with debounce
    useEffect(() => {
        const handleResizeComplete = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            // Only reset if change is significant (>15%)
            const widthChange = Math.abs(newWidth - screenDimensions.width) / screenDimensions.width;
            const heightChange = Math.abs(newHeight - screenDimensions.height) / screenDimensions.height;
            if (widthChange > 0.15 || heightChange > 0.15) {
                setScreenDimensions({ width: newWidth, height: newHeight });
                // Force FloatingCharacters component reset
                setFloatingCharKey(prevKey => prevKey + 1);
                // Check if screen is too narrow for menu
                setIsTooNarrow(newWidth < (MENU_WIDTH + MINIMUM_PADDING * 2));
            }
        };

        // 300ms debounce
        const debouncedResizeHandler = debounce(handleResizeComplete, 300);
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
            <FloatingCharacters key={floatingCharKey} />
            {!isTooNarrow && <MenuOverlay />}
        </div>
    );
};

export default HomePage;