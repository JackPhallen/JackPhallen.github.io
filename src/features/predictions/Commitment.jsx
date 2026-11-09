import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from './Card';
import Verdict from './Verdict';
import { checkEarlier, checkReveal } from './checks';
import { hashPrediction } from './link';

const MakeYourOwn = () => (
    <Link className="predictions__own" to="/fun/predictions">
        <span>make your own</span>
        <ArrowRight size={14} aria-hidden="true" />
    </Link>
);

const SenderNote = () => (
    <div className="predictions__meta predictions__meta--below-card">
        the title and date are set by the sender — only the prediction is locked in by the hash
    </div>
);

const Sealed = ({ hash }) => {
    const [value, setValue] = useState('');
    const result = checkReveal(value, hash);

    return (
        <section className="predictions__panel">
            <label className="predictions__label" htmlFor="reveal-input">&gt; got the reveal?</label>
            <textarea
                id="reveal-input"
                className="predictions__input"
                rows={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="paste the revealed text or the reveal link"
                spellCheck={false}
            />
            <Verdict tone={result?.tone}>{result?.message}</Verdict>
        </section>
    );
};

const Revealed = ({ hash, text, matches }) => {
    const [earlier, setEarlier] = useState('');
    const result = checkEarlier(earlier, hash);

    return (
        <section className="predictions__panel">
            <div className="predictions__label">&gt; prediction</div>
            <div className="predictions__text">{text.trim()}</div>

            {matches ? (
                <>
                    <label className="predictions__label predictions__label--step" htmlFor="earlier-input">
                        &gt; is this the prediction you were sent?
                    </label>
                    <div className="predictions__hint">
                        anyone can make a reveal link for any text. paste the share link you got
                        earlier to check it has the same hash.
                    </div>
                    <input
                        id="earlier-input"
                        className="predictions__input"
                        type="text"
                        value={earlier}
                        onChange={(e) => setEarlier(e.target.value)}
                        placeholder="paste the earlier share link or hash"
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <Verdict tone={result?.tone}>{result?.message}</Verdict>
                </>
            ) : (
                <Verdict tone="bad">
                    this text doesn't match the hash in this link — it was cut off or edited.
                    ask for the link again.
                </Verdict>
            )}
        </section>
    );
};

const Commitment = ({ commitment }) => {
    const { valid, hash, title, createdAt, text } = commitment;

    if (!valid) {
        return (
            <div className="predictions">
                <div className="predictions__heading">PREDICTION COMMITMENT</div>
                <p className="predictions__warning">this link is broken or incomplete — it may have been cut off.</p>
                <MakeYourOwn />
            </div>
        );
    }

    const revealed = text !== null;
    const matches = revealed && hashPrediction(text) === hash;
    let status = 'sealed';
    if (revealed) status = matches ? 'revealed' : 'mismatch';

    return (
        <div className="predictions">
            <Card hash={hash} title={title} createdAt={createdAt} status={status} />
            <SenderNote />
            {revealed ? <Revealed hash={hash} text={text} matches={matches} /> : <Sealed hash={hash} />}
            <MakeYourOwn />
        </div>
    );
};

export default Commitment;
