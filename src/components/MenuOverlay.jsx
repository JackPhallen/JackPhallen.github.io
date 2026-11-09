import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './MenuOverlay.css';

export const MENU_WIDTH = 340;

// An item either navigates to a path or opens a submenu in place (items)
const MENU_ITEMS = [
    {
        label: "FUN",
        items: [
            { label: "MORRIS TRAVERSAL", path: "/fun/morris" },
            { label: "PREDICTIONS", path: "/fun/predictions" }
        ]
    },
    { label: "ABOUT", path: "/about" },
    { label: "LINKS", path: "/links" }
];

const ROOT_MENU = { title: 'MAIN MENU', items: MENU_ITEMS };

// Appended to every submenu so touch users (no ESC key) can get back
const BACK_ITEM = { label: "BACK", back: true };

const MenuOverlay = ({ onClose }) => {
    const navigate = useNavigate();

    // Current menu level — submenus swap in place, no page load
    const [menu, setMenu] = useState(ROOT_MENU);
    const isRoot = menu === ROOT_MENU;

    // Hovered and selected menu item for styling purposes
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Switch menu level and clear selection in the same batch
    const openMenu = useCallback((next) => {
        setMenu(next);
        setSelectedIndex(null);
        setHoveredIndex(null);
    }, []);

    const activateItem = useCallback((item) => {
        if (item.back) {
            openMenu(ROOT_MENU);
        } else if (item.items) {
            openMenu({ title: item.label, items: [...item.items, BACK_ITEM] });
        } else {
            navigate(item.path);
        }
    }, [navigate, openMenu]);

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
                        return (prevIndex + 1) % menu.items.length;
                    });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prevIndex => {
                        // If no item is selected, select last
                        if (prevIndex === null) return menu.items.length - 1;
                        // Move index up or wrap to end
                        return (prevIndex - 1 + menu.items.length) % menu.items.length;
                    });
                    break;
                case 'Enter':
                    // Open submenu or navigate to selected
                    if (selectedIndex !== null) {
                        e.preventDefault();
                        activateItem(menu.items[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    // Back to the root menu, or close from the root
                    if (isRoot) {
                        onClose();
                    } else {
                        openMenu(ROOT_MENU);
                    }
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIndex, onClose, menu, isRoot, activateItem, openMenu]);

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
                <h2 className="menu-overlay__title">{menu.title}</h2>

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
                {menu.items.map((item, index) => (
                    <button
                        type="button"
                        id={`menu-item-${index}`}
                        key={item.label}
                        className={
                            'menu-overlay__item' +
                            (hoveredIndex === index ? ' menu-overlay__item--hovered' : '') +
                            (selectedIndex === index ? ' menu-overlay__item--selected' : '')
                        }
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => hoveredIndex === index && selectedIndex === null && setHoveredIndex(null)}
                        onClick={() => activateItem(item)}
                    >
                        {item.back ? `< ${item.label}` : `> ${item.label}`}
                    </button>
                ))}

                {/* Footer */}
                <div className="menu-overlay__footer">
                    <div className="menu-overlay__footer-scanlines"></div>
                    {isRoot
                        ? 'Navigate: [▲][▼] | Select: [⮐]'
                        : 'Navigate: [▲][▼] | Select: [⮐] | Back: [ESC]'}
                </div>
            </div>
        </div>
    );
};

export default MenuOverlay;
