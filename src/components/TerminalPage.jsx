import React, { useState, useEffect, useRef } from 'react';
import TerminalShell, { TerminalCommandLine } from './TerminalShell';
import { useTypedCommand } from './useTypedCommand';
import './TerminalPage.css';

// Typing speed constants
const CONTENT_FRAME_DELAY = 1;    // Frames to wait between words (higher = slower)
const CONTENT_WORDS_PER_FRAME = 5; // Number of words to display per frame
const LINE_BREAK_PAUSE_FRAMES = 0; // Pause frames between lines

const TerminalPage = ({ title, commandText, content }) => {
    const { typedCommand, commandDone } = useTypedCommand(commandText);
    const [displayedLines, setDisplayedLines] = useState([]);

    // Animation state references
    const animationRef = useRef(null);
    const contentStateRef = useRef({
        lineIndex: 0,
        wordIndex: 0,
        frameCount: 0,
        lineComplete: false,
        processingPause: false
    });

    // Display content after command is typed using requestAnimationFrame
    useEffect(() => {
        if (!commandDone || !content || content.length === 0) return;

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
    }, [commandDone, content]);

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
        <TerminalShell
            title={title}
            hints={[{ key: '▲/▼', action: 'scroll' }]}
            statusExtra={<span>Line {displayedLines.length}/~</span>}
            scrollKeys
        >
            <TerminalCommandLine command={typedCommand} done={commandDone} />

            <div className="terminal-content">
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
        </TerminalShell>
    );
};

export default TerminalPage;
