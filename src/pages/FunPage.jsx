import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MorrisTraversal from '../features/morris-traversal/MorrisTraversal';
import './FunPage.css';

const COMMAND = './fun/morris_traversal --animate';
const TYPE_DELAY_MS = 45;
const MOBILE_THRESHOLD = 600;
const CURSOR = 'jackphallen:~ $ ';

const FunPage = () => {
    const navigate = useNavigate();
    const [typedCommand, setTypedCommand] = useState('');
    const [commandDone, setCommandDone] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < MOBILE_THRESHOLD);

    // track viewport width for the compact status bar
    useEffect(() => {
        const checkMobileView = () => setIsMobileView(window.innerWidth < MOBILE_THRESHOLD);
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // UTC clock in the status bar
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // ESC returns to the menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') navigate('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Type out the command, then reveal the visualization
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setTypedCommand(COMMAND);
            setCommandDone(true);
            return undefined;
        }
        let index = 0;
        const timer = setInterval(() => {
            index++;
            setTypedCommand(COMMAND.slice(0, index));
            if (index >= COMMAND.length) {
                clearInterval(timer);
                setCommandDone(true);
            }
        }, TYPE_DELAY_MS);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fun-page">
            {/* Status bar */}
            <div className="fun-status-bar">
                <div className="fun-status-bar__left">
                    <button
                        type="button"
                        className="fun-back-button"
                        onClick={() => navigate('/')}
                    >
                        {isMobileView ? '←' : '← Back'}
                    </button>

                    <div className="fun-status-bar__info">
                        {!isMobileView && (
                            <>
                                [ <span className="fun-status-bar__key">ESC</span>:menu ]&nbsp;
                                [ <span className="fun-status-bar__key">◀/▶</span>:step ]&nbsp;
                                [ <span className="fun-status-bar__key">SPACE</span>:play ] |&nbsp;
                            </>
                        )}
                        <span className="fun-status-bar__title">Fun</span>
                    </div>
                </div>

                {!isMobileView && (
                    <div className="fun-status-bar__time">{currentTime}</div>
                )}
            </div>

            {/* Typed command line */}
            <div className="fun-command-line">
                <span className="fun-prompt">{CURSOR}</span>
                <span className="fun-command">{typedCommand}</span>
                {!commandDone && <span className="fun-cursor">&nbsp;</span>}
            </div>

            {commandDone && (
                <div className="fun-content">
                    <div className="fun-heading">MORRIS IN-ORDER TRAVERSAL</div>
                    <div className="fun-subheading">
                        tree traversal in O(1) extra space — no recursion, no stack, just threads
                    </div>
                    <MorrisTraversal />
                </div>
            )}
        </div>
    );
};

export default FunPage;
