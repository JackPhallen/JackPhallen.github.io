import './TerminalStatusBar.css';

const TerminalStatusBar = ({ title, hints = [], statusExtra = null, currentTime, isMobileView, onBack }) => (
    <div className="terminal-status-bar">
        <div className="terminal-status-bar__left">
            <button
                type="button"
                className="terminal-status-bar__back"
                onClick={onBack}
            >
                {isMobileView ? '←' : '← Back'}
            </button>

            <div className="terminal-status-bar__info">
                {!isMobileView && (
                    <>
                        [ <span className="terminal-status-bar__key">ESC</span>:menu ]
                        {hints.map((hint) => (
                            <span key={hint.key}>
                                {' [ '}
                                <span className="terminal-status-bar__key">{hint.key}</span>
                                {`:${hint.action} ]`}
                            </span>
                        ))}
                        {' |'}&nbsp;
                    </>
                )}
                <span className="terminal-status-bar__title">{title}</span>
                {statusExtra && <>&nbsp;|&nbsp;{statusExtra}</>}
            </div>
        </div>

        {/* UTC Time display - hidden on mobile */}
        {!isMobileView && (
            <div className="terminal-status-bar__time">{currentTime}</div>
        )}
    </div>
);

export default TerminalStatusBar;
