import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TerminalPage.css';

// Typing speed constants
const COMMAND_FRAME_DELAY = 2;    // Frames to wait between each command character (higher = slower)
const CONTENT_FRAME_DELAY = 1;    // Frames to wait between words (higher = slower)
const CONTENT_WORDS_PER_FRAME = 5; // Number of words to display per frame
const LINE_BREAK_PAUSE_FRAMES = 0; // Pause frames between lines

const MOBILE_THRESHOLD = 600;

const CURSOR = "jackphallen:~ $ "

const TerminalPage = ({ title, commandText, content }) => {
    const [displayedCommand, setDisplayedCommand] = useState('');
    const [displayedLines, setDisplayedLines] = useState([]);
    const [commandComplete, setCommandComplete] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const terminalRef = useRef(null);
    const navigate = useNavigate();

    // Animation state references
    const animationRef = useRef(null);
    const contentStateRef = useRef({
        lineIndex: 0,
        wordIndex: 0,
        frameCount: 0,
        lineComplete: false,
        processingPause: false
    });

    // Check for mobile view on initial load and window resize
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < MOBILE_THRESHOLD);
        };
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    // Update UTC time every second
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const utcTimeString = now.toISOString().slice(0, 19).replace('T', ' ');
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
                    terminalRef.current.scrollTop += 30;
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

    // Type out the command using requestAnimationFrame
    useEffect(() => {
        if (!commandText) return;

        // Command animation state
        const commandStateRef = { index: 0, frameCount: 0 };
        let commandAnimationRef = null;

        const animateCommandTyping = () => {
            commandStateRef.frameCount++;

            // Only process every COMMAND_FRAME_DELAY frames
            if (commandStateRef.frameCount % COMMAND_FRAME_DELAY !== 0) {
                commandAnimationRef = requestAnimationFrame(animateCommandTyping);
                return;
            }

            if (commandStateRef.index <= commandText.length) {
                setDisplayedCommand(commandText.substring(0, commandStateRef.index));
                commandStateRef.index++;
                commandAnimationRef = requestAnimationFrame(animateCommandTyping);
            } else {
                setCommandComplete(true);
            }
        };

        // Start command animation
        commandAnimationRef = requestAnimationFrame(animateCommandTyping);

        return () => {
            if (commandAnimationRef) {
                cancelAnimationFrame(commandAnimationRef);
            }
        };
    }, [commandText]);

    // Display content after command is typed using requestAnimationFrame
    useEffect(() => {
        if (!commandComplete || !content || content.length === 0) return;

        // Reset content state
        contentStateRef.current = {
            lineIndex: 0,
            wordIndex: 0,
            frameCount: 0,
            currentLineText: '',
            lineComplete: false,
            processingPause: false
        };

        // Animation function using requestAnimationFrame
        const animateContentDisplay = () => {
            const state = contentStateRef.current;
            state.frameCount++;

            // Only process every CONTENT_FRAME_DELAY frames for speed control
            if (state.frameCount % CONTENT_FRAME_DELAY !== 0) {
                animationRef.current = requestAnimationFrame(animateContentDisplay);
                return;
            }

            // If we're at the end of all content
            if (state.lineIndex >= content.length) {
                cancelAnimationFrame(animationRef.current);
                return;
            }

            // If we're in a line break pause
            if (state.processingPause) {
                state.pauseFrames--;
                if (state.pauseFrames <= 0) {
                    state.processingPause = false;
                    state.lineIndex++;
                    state.wordIndex = 0;
                    state.currentLineText = '';
                    state.lineComplete = false;
                }
                animationRef.current = requestAnimationFrame(animateContentDisplay);
                return;
            }

            const currentLine = content[state.lineIndex];

            // If this is a new line, initialize it in displayedLines
            if (state.wordIndex === 0) {
                setDisplayedLines(prevLines => {
                    const newLines = [...prevLines];
                    newLines[state.lineIndex] = {
                        text: '',
                        style: currentLine.style,
                        link: currentLine.link
                    };
                    return newLines;
                });
            }

            // Split the line into words
            const words = currentLine.text.split(' ');

            // Process multiple words per frame
            for (let i = 0; i < CONTENT_WORDS_PER_FRAME; i++) {
                if (state.wordIndex < words.length) {
                    // Add the next word
                    const word = words[state.wordIndex];
                    state.currentLineText += word;

                    // Add a space unless it's the last word
                    if (state.wordIndex < words.length - 1) {
                        state.currentLineText += ' ';
                    }

                    state.wordIndex++;
                } else {
                    state.lineComplete = true;
                    break;
                }
            }

            // Update displayed lines
            setDisplayedLines(prevLines => {
                const newLines = [...prevLines];
                newLines[state.lineIndex] = {
                    text: state.currentLineText,
                    style: currentLine.style,
                    link: currentLine.link
                };
                return newLines;
            });

            // Check if we need to move to the next line
            if (state.lineComplete) {
                state.processingPause = true;
                state.pauseFrames = LINE_BREAK_PAUSE_FRAMES;
            }

            // Continue animation
            animationRef.current = requestAnimationFrame(animateContentDisplay);
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animateContentDisplay);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [commandComplete, content]);

    // Get CSS class for a style
    const getStyleClass = (style) => {
        if (!style) return 'terminal-text'; // Add default style if style is undefined
        switch (style) {
            case 'bold':
                return 'terminal-bold';
            case 'default':
            default:
                return 'terminal-text';
        }
    };

    return (
        <div className="terminal-container">
            {/* Status bar at the top */}
            <div className="terminal-status-bar">
                <div className="terminal-status-bar__left">
                    <button
                        type="button"
                        className="terminal-back-button"
                        onClick={() => navigate('/')}
                        style={{
                            padding: isMobileView ? '2px 6px' : '2px 8px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.4)'}
                        onMouseUp={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)'}
                    >
                        {isMobileView ? '←' : '← Back'}
                    </button>

                    <div className="terminal-status-bar__info">
                        {!isMobileView && (
                            <>
                                [ <span className="terminal-status-bar__key">ESC</span>:menu ] [ <span className="terminal-status-bar__key">▲/▼</span>:scroll ] |&nbsp;
                            </>
                        )}
                        <span className="terminal-status-bar__title" style={{ marginLeft: isMobileView ? 0 : '4px' }}>{title}</span>&nbsp;|&nbsp;
                        <span>Line {displayedLines.length}/~</span>
                    </div>
                </div>

                {/* UTC Time display - hidden on mobile */}
                {!isMobileView && (
                    <div className="terminal-status-bar__time">
                        {currentTime}
                    </div>
                )}
            </div>

            <div className="terminal-content" ref={terminalRef}>
                <div className="terminal-command-line">
                    <span className="terminal-prompt">
                        {CURSOR}
                    </span>
                    <span className="terminal-command">{displayedCommand}</span>
                    {!commandComplete && (
                        <span className="terminal-cursor">&nbsp;</span>
                    )}
                </div>

                <div className="terminal-output">
                    {displayedLines.map((line, index) => (
                        <div
                            key={index}
                            className={getStyleClass(line?.style)}
                        >
                            {line?.link ? (
                                <>
                                    {line.text.match(/^\s*/)[0]}
                                    <a
                                        href={line.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {line.text.trimStart()}
                                    </a>
                                </>
                            ) : (
                                line?.text
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TerminalPage;