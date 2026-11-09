import { formatUtc } from './link';
import './card.css';

const STATUS = {
    sealed: { glyph: '●', text: 'sealed' },
    revealed: { glyph: '◆', text: 'revealed' },
    mismatch: { glyph: '✗', text: 'broken link' },
};

const Card = ({ hash, title, createdAt, status = 'sealed' }) => {
    const hashRows = hash.match(/.{16}/g);
    const { glyph, text } = STATUS[status];

    return (
        <div className="prediction-card">
            <div className="prediction-card__header">
                <span className="prediction-card__heading">PREDICTION COMMITMENT</span>
                {createdAt && <span className="prediction-card__time">created {formatUtc(createdAt)}</span>}
            </div>

            {title && <div className="prediction-card__title">&gt; {title}</div>}

            <div className="prediction-card__hash-label">sha-256</div>
            <div className="prediction-card__hash">
                {hashRows.map((row, i) => <span key={i} className="prediction-card__hash-row">{row}</span>)}
            </div>

            <div className="prediction-card__footer">
                <span className={`prediction-card__status prediction-card__status--${status}`}>
                    <span aria-hidden="true">{glyph}</span> {text}
                </span>
                <span>jackphallen.com</span>
            </div>
        </div>
    );
};

export default Card;
