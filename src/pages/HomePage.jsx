import { useState } from 'react';
import FloatingCharacters from '../features/floating-characters/FloatingCharacters';
import MenuOverlay, { MENU_WIDTH } from '../components/MenuOverlay';
import TerminalIcon from '../components/TerminalIcon';
import './HomePage.css';

const MINIMUM_PADDING = 60;

const hasRoomForMenu = () => window.innerWidth >= MENU_WIDTH + MINIMUM_PADDING * 2;

const HomePage = () => {
    const [isMenuVisible, setIsMenuVisible] = useState(hasRoomForMenu);

    const toggleMenu = () => setIsMenuVisible((visible) => !visible);

    return (
        <div className="home-page">
            {/* Floating characters background - shown on all devices */}
            <FloatingCharacters />

            {/* Terminal menu button - only visible when menu is hidden */}
            {!isMenuVisible && <TerminalIcon onClick={toggleMenu} />}

            {/* Menu Overlay - shown when isMenuVisible is true */}
            {isMenuVisible && <MenuOverlay onClose={toggleMenu} />}
        </div>
    );
};

export default HomePage;
