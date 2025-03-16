import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Typing speed constants (in milliseconds)
const COMMAND_TYPING_SPEED = 100; // Slower typing for the command (100 before)
const CONTENT_TYPING_SPEED = 2;  // Faster typing for content (10 before)
const LINE_BREAK_PAUSE = 5;      // Pause between lines (30 before)

const CURSOR = "jackphallen:~ $ "

const TerminalPage = ({ title, commandText, content }) => {
    const [displayedCommand, setDisplayedCommand] = useState('');
    const [displayedLines, setDisplayedLines] = useState([]);
    const [commandComplete, setCommandComplete] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const terminalRef = useRef(null);
    const navigate = useNavigate();

    // Update UTC time every second
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const utcTimeString = now.toISOString().substr(0, 19).replace('T', ' ');
            setCurrentTime(utcTimeString + ' UTC');
        };

        // Update immediately and then every second
        updateTime();
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    // Handle ESC key to return to home and arrow keys for scrolling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate('/');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (terminalRef.current) {
                    terminalRef.current.scrollTop += 30; // Adjust line height as needed
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (terminalRef.current) {
                    terminalRef.current.scrollTop -= 30;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    // Type out the command
    useEffect(() => {
        if (!commandText) return;

        let index = 0;
        const timer = setInterval(() => {
            if (index <= commandText.length) {
                setDisplayedCommand(commandText.substring(0, index));
                index++;
            } else {
                clearInterval(timer);
                setCommandComplete(true);
            }
        }, COMMAND_TYPING_SPEED); // Slower command typing speed

        return () => clearInterval(timer);
    }, [commandText]);

    // Display content after command is typed
    useEffect(() => {
        if (!commandComplete || !content || content.length === 0) return;

        let lineIndex = 0;
        let charIndex = 0;
        let timerRef = null;

        const typeCharacter = () => {
            if (lineIndex < content.length) {
                const currentLine = content[lineIndex];

                if (charIndex <= currentLine.text.length) {
                    setDisplayedLines(prevLines => {
                        const newLines = [...prevLines];
                        // If this is a new line, add it
                        if (newLines.length <= lineIndex) {
                            newLines.push({
                                text: currentLine.text.substring(0, charIndex),
                                style: currentLine.style
                            });
                        } else {
                            // Otherwise update existing line
                            newLines[lineIndex] = {
                                text: currentLine.text.substring(0, charIndex),
                                style: currentLine.style
                            };
                        }
                        return newLines;
                    });

                    charIndex++;
                } else {
                    // Move to next line
                    lineIndex++;
                    charIndex = 0;

                    // Add a small pause between lines
                    clearInterval(timerRef);
                    setTimeout(() => {
                        timerRef = setInterval(typeCharacter, CONTENT_TYPING_SPEED); // Content typing speed
                    }, LINE_BREAK_PAUSE); // Pause between lines
                    return;
                }
            } else {
                clearInterval(timerRef);
            }
        };

        timerRef = setInterval(typeCharacter, CONTENT_TYPING_SPEED); // Content typing speed

        return () => {
            if (timerRef) clearInterval(timerRef);
        };
    }, [commandComplete, content]);

    // Get CSS class for a style
    const getStyleClass = (style) => {
        switch (style) {
            case 'bold':
                return 'terminal-bold';
            case 'default':
            default:
                return 'terminal-text';
        }
    };

    return (
        <div className="terminal-container" style={{
            backgroundColor: '#000000',
            color: '#33ff33',
            fontFamily: '"Courier New", monospace',
            padding: '20px',
            paddingTop: '40px', // Extra padding for the status bar
            minHeight: '100vh',
            whiteSpace: 'pre-wrap',
            overflow: 'auto'
        }}>
            {/* Status bar at the top */}
            <div
                className="terminal-status-bar"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    backgroundColor: '#111111',
                    borderBottom: '1px solid #333',
                    color: '#33ff33',
                    padding: '6px 10px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 100
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                        className="terminal-back-button"
                        onClick={() => navigate('/')}
                        style={{
                            cursor: 'pointer',
                            marginRight: '15px',
                            padding: '2px 8px',
                            backgroundColor: 'rgba(50, 50, 50, 0.8)',
                            border: '1px solid #444',
                            borderRadius: '3px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            transition: 'all 0.1s ease',
                            display: 'inline-block'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.4)'}
                        onMouseUp={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)'}
                    >
                        ← Back
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#aaffaa' }}>
                        [ <span style={{ color: '#ffff99' }}>ESC</span>:menu ] [ <span style={{ color: '#ffff99' }}>▲/▼</span>:scroll ] |&nbsp;
                        <span style={{ color: '#66aaff', marginLeft: '4px' }}>{title}</span>&nbsp;|&nbsp;
                        <span>Line {displayedLines.length}/~</span>
                    </div>
                </div>

                {/* UTC Time display */}
                <div style={{
                    color: '#aaffaa',
                    fontSize: '13px',
                    marginRight: '10px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(20, 20, 20, 0.7)',
                    border: '1px solid #333',
                    borderRadius: '2px'
                }}>
                    {currentTime}
                </div>
            </div>

            <div className="terminal-content" ref={terminalRef} style={{
                height: 'calc(100vh - 40px)',
                overflowY: 'auto'
            }}>
                <div className="terminal-command-line">
                    <span className="terminal-prompt" style={{ color: '#33ff33' }}>
                        {CURSOR}
                    </span>
                    <span className="terminal-command">{displayedCommand}</span>
                    {!commandComplete && (
                        <span className="terminal-cursor" style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '16px',
                            backgroundColor: '#33ff33',
                            marginLeft: '1px',
                            animation: 'blink 1s step-end infinite'
                        }}>&nbsp;</span>
                    )}
                </div>

                <div className="terminal-output" style={{ marginTop: '10px' }}>
                    {displayedLines.map((line, index) => (
                        <div
                            key={index}
                            className={getStyleClass(line.style)}
                            style={{
                                lineHeight: '1.4',
                                ...(line.style === 'bold' ? {
                                    fontWeight: 'bold',
                                    color: '#5fff5f'
                                } : {})
                            }}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default TerminalPage;