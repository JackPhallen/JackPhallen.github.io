import React from 'react';
import { Terminal } from 'lucide-react';

// Icon that triggers the menu to be shown
const TerminalIcon = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 1000,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                boxShadow: '0 0 10px 2px rgba(0, 255, 255, 0.7)',
                animation: 'pulse 2s infinite alternate'
            }}
        >
            <Terminal
                size={24}
                color="#0ff" // Cyan color
            />
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.7);
                    }
                    100% {
                        box-shadow: 0 0 15px 4px rgba(0, 255, 255, 0.9);
                    }
                }
                `
            }} />
        </div>
    );
};

export default TerminalIcon;