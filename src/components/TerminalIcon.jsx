import React from 'react';
import { Terminal } from 'lucide-react';
import './TerminalIcon.css';

// Icon that triggers the menu to be shown
const TerminalIcon = ({ onClick }) => {
    return (
        <button
            type="button"
            className="terminal-icon"
            aria-label="Open menu"
            onClick={onClick}
        >
            <Terminal
                size={24}
                color="#0ff" // Cyan color
            />
        </button>
    );
};

export default TerminalIcon;
