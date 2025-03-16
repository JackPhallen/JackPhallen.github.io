import React, { useState } from 'react';

const MenuOverlay = () => {
    // Menu items
    const menuItems = [
        { label: "PROGRAMS", href: "#" },
        { label: "PORTFOLIO", href: "#" },
        { label: "ABOUT", href: "#" },
        { label: "CONTACT", href: "#" }
    ];

    // Track hover state for each item
    const [hoveredIndex, setHoveredIndex] = useState(null);

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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(150, 150, 150, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.3)'
        }}>
            {/* Menu header */}
            <div style={{
                background: 'linear-gradient(to bottom, #000080, #000066)',
                padding: '10px',
                textAlign: 'center',
                borderBottom: '1px solid #555',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
            }}>
                <h2 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '18px',
                    letterSpacing: '2px',
                    textShadow: '0 2px 2px rgba(0, 0, 0, 0.5)'
                }}>MAIN MENU</h2>
            </div>

            {/* Menu items */}
            <div style={{
                padding: '15px'
            }}>
                {menuItems.map((item, index) => (
                    <div
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
                            transform: hoveredIndex === index ? 'translateX(2px)' : 'none'
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {`> ${item.label}`}
                    </div>
                ))}

                {/* Footer */}
                <div style={{
                    color: '#777',
                    fontSize: '12px',
                    textAlign: 'center',
                    paddingTop: '12px',
                    borderTop: '1px dashed rgba(100, 100, 100, 0.3)',
                    marginTop: '8px',
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
                    System ready. Type 'HELP' for commands.
                </div>
            </div>
        </div>
    );
};

export default MenuOverlay;