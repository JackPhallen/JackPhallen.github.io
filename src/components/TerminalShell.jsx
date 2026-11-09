import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalStatusBar from './TerminalStatusBar';
import './TerminalShell.css';

const MOBILE_THRESHOLD = 600;

// scrollKeys opts into ▲/▼ scrolling — never on /fun/morris, the Morris player owns arrows there
const TerminalShell = ({ title, hints = [], statusExtra = null, scrollKeys = false, children }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState('');
    const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < MOBILE_THRESHOLD);
    const scrollRef = useRef(null);

    // track viewport width for the compact status bar
    useEffect(() => {
        const checkMobileView = () => setIsMobileView(window.innerWidth < MOBILE_THRESHOLD);
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // UTC clock in the status bar
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle ESC key to return to home and arrow keys for scrolling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.defaultPrevented) return;
            const field = e.target instanceof Element ? e.target.closest('input, textarea') : null;
            if (e.key === 'Escape') {
                if (field) {
                    field.blur();
                } else {
                    navigate('/');
                }
            } else if (scrollKeys && scrollRef.current && !field) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    scrollRef.current.scrollTop += 30;
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    scrollRef.current.scrollTop -= 30;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, scrollKeys]);

    return (
        <div className="terminal-shell" ref={scrollRef}>
            <TerminalStatusBar
                title={title}
                hints={hints}
                statusExtra={statusExtra}
                currentTime={currentTime}
                isMobileView={isMobileView}
                onBack={() => navigate('/')}
            />
            {children}
        </div>
    );
};

export const TerminalCommandLine = ({ command, done }) => (
    <div className="terminal-command-line">
        <span className="terminal-prompt">jackphallen:~ $ </span>
        <span className="terminal-command">{command}</span>
        {!done && <span className="terminal-cursor">&nbsp;</span>}
    </div>
);

export default TerminalShell;
