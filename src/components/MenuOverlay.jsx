import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './MenuOverlay.css';

export const MENU_WIDTH = 340;

const MENU_ITEMS = [
    { label: "FUN", path: "/fun" },
    { label: "ABOUT", path: "/about" },
    { label: "LINKS", path: "/links" }
];

const MenuOverlay = ({ onClose }) => {
    const navigate = useNavigate();

    // Hovered and selected menu item for styling purposes
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Keyboard navigation logic
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prevIndex => {
                        // If no item is selected, select the first one
                        if (prevIndex === null) return 0;
                        // Move index down or wrap to start
                        return (prevIndex + 1) % MENU_ITEMS.length;
                    });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prevIndex => {
                        // If no item is selected, select last
                        if (prevIndex === null) return MENU_ITEMS.length - 1;
                        // Move index up or wrap to end
                        return (prevIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
                    });
                    break;
                case 'Enter':
                    // Navigate to selected
                    if (selectedIndex !== null) {
                        e.preventDefault();
                        navigate(MENU_ITEMS[selectedIndex].path);
                    }
                    break;
                case 'Escape':
                    // Close menu
                    onClose();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate, selectedIndex, onClose]);

    // Set hovered index when selected changes
    useEffect(() => {
        setHoveredIndex(selectedIndex);
    }, [selectedIndex]);

    // Clear the selected index when mouse interaction begins
    const handleMouseEnter = (index) => {
        setSelectedIndex(null);
        setHoveredIndex(index);
    };

    return (
        <div className="menu-overlay" style={{ '--menu-width': `${MENU_WIDTH}px` }}>
            {/* Menu header */}
            <div className="menu-overlay__header">
                <h2 className="menu-overlay__title">MAIN MENU</h2>

                {/* Close button - always shown */}
                <button
                    type="button"
                    className="menu-overlay__close"
                    aria-label="Close menu"
                    onClick={() => {
                        if (onClose) onClose();
                    }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Menu items */}
            <div className="menu-overlay__items">
                {MENU_ITEMS.map((item, index) => (
                    <button
                        type="button"
                        id={`menu-item-${index}`}
                        key={index}
                        className={
                            'menu-overlay__item' +
                            (hoveredIndex === index ? ' menu-overlay__item--hovered' : '') +
                            (selectedIndex === index ? ' menu-overlay__item--selected' : '')
                        }
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => hoveredIndex === index && selectedIndex === null && setHoveredIndex(null)}
                        onClick={() => navigate(item.path)}
                    >
                        {`> ${item.label}`}
                    </button>
                ))}

                {/* Footer */}
                <div className="menu-overlay__footer">
                    <div className="menu-overlay__footer-scanlines"></div>
                    Navigate: [▲][▼] | Select: [⮐]
                </div>
            </div>
        </div>
    );
};

export default MenuOverlay;
