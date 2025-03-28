import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const MENU_ITEMS = [
    { label: "PROJECTS", path: "/projects" },
    { label: "RESUME", path: "/resume" },
    { label: "ABOUT", path: "/about" },
    { label: "CONTACT", path: "/contact" }
];

const MenuOverlay = ({ onClose }) => {
    const navigate = useNavigate();

    // Hobered and selected menu item for styling purposes
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
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '340px',
            backgroundColor: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(100, 100, 100, 0.3)',
            borderRadius: '4px',
            zIndex: 1000,
            fontFamily: '"Courier New", monospace',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(150, 150, 150, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.3)',
            // Disable text selection for all clients
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
        }}>
            {/* Menu header */}
            <div style={{
                background: 'linear-gradient(to bottom, #000080, #000066)',
                padding: '10px',
                textAlign: 'center',
                borderBottom: '1px solid #555',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                position: 'relative'
            }}>
                <h2 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '18px',
                    letterSpacing: '2px',
                    textShadow: '0 2px 2px rgba(0, 0, 0, 0.5)'
                }}>MAIN MENU</h2>

                {/* Close button - always shown */}
                <div
                    onClick={() => {
                        console.log("Close button clicked in MenuOverlay");
                        if (onClose) onClose();
                    }}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '3px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1010
                    }}
                >
                    <X size={16} />
                </div>
            </div>

            {/* Menu items */}
            <div style={{
                padding: '15px'
            }}>
                {MENU_ITEMS.map((item, index) => (
                    <div
                        id={`menu-item-${index}`}
                        key={index}
                        style={{
                            marginBottom: '12px',
                            padding: '10px 12px',
                            backgroundColor: hoveredIndex === index ? 'rgba(30, 30, 40, 0.9)' : 'rgba(20, 20, 30, 0.8)',
                            border: '1px solid rgba(80, 80, 100, 0.4)',
                            borderLeft: hoveredIndex === index ? '3px solid #0f8' : '1px solid rgba(80, 80, 100, 0.4)',
                            color: hoveredIndex === index ? '#0fa' : '#0f8',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '2px',
                            boxShadow: hoveredIndex === index
                                ? '0 2px 8px rgba(0, 255, 170, 0.15), inset 0 0 10px rgba(0, 255, 170, 0.05)'
                                : '0 1px 3px rgba(0, 0, 0, 0.2)',
                            transform: hoveredIndex === index ? 'translateX(2px)' : 'none',
                            // Add outline for keyboard focus
                            outline: selectedIndex === index ? '2px solid #0fa' : 'none',
                        }}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => hoveredIndex === index && selectedIndex === null && setHoveredIndex(null)}
                        onClick={() => navigate(item.path)}
                    >
                        {`> ${item.label}`}
                    </div>
                ))}

                {/* Footer */}
                <div style={{
                    color: '#777',
                    fontSize: '16px',
                    textAlign: 'center',
                    paddingTop: '10px',
                    borderTop: '1px dashed rgba(100, 100, 100, 0.3)',
                    marginTop: '6px',
                    position: 'relative',
                    textShadow: '0 1px 1px rgba(0,0,0,0.5)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4))',
                        backgroundSize: '100% 4px',
                        pointerEvents: 'none',
                        opacity: 0.1,
                        zIndex: 2
                    }}></div>
                    Navigate: [▲][▼] | Select: [⮐]
                </div>
            </div>
        </div>
    );
};

export default MenuOverlay;