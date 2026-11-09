import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Eraser, ShieldCheck, XCircle } from 'lucide-react';
// js-sha256 hashes strings as their UTF-8 bytes, synchronously — Web Crypto's
// async digest would need race handling for a hash that updates per keystroke
import { sha256 } from 'js-sha256';
import './predictions.css';

const HEX64 = /^[0-9a-f]{64}$/;

const encoder = new TextEncoder();
const byteLength = (text) => encoder.encode(text).length;

// navigator.clipboard is undefined outside secure contexts (e.g. dev over LAN IP)
const copyText = async (value) => {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false;
    }
};

const CopyButton = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleCopy = async () => {
        const ok = await copyText(value);
        if (!ok) return;
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            className="predictions-btn"
            onClick={handleCopy}
            disabled={!value}
        >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            <span>{copied ? 'Copied' : label}</span>
        </button>
    );
};

const Predictions = () => {
    // commit: prediction text -> live sha-256. Leading/trailing whitespace is
    // trimmed on BOTH sides (commit and verify) so a stray newline from a
    // paste can't break a match; everything inside the text is hashed as-is.
    const [prediction, setPrediction] = useState('');
    const committed = prediction.trim();
    const hash = useMemo(() => (committed ? sha256(committed) : ''), [committed]);

    // verify: revealed text + claimed hash -> live verdict
    const [reveal, setReveal] = useState('');
    const [claimedHash, setClaimedHash] = useState('');
    const verdict = useMemo(() => {
        const normalized = claimedHash.trim().toLowerCase().replace(/^sha256:/, '');
        if (!normalized) return null;
        if (!HEX64.test(normalized)) {
            // stay quiet while a partial hash is still being typed
            const malformed = normalized.length > 64 || /[^0-9a-f]/.test(normalized);
            return malformed ? 'invalid' : null;
        }
        return sha256(reveal.trim()) === normalized ? 'match' : 'mismatch';
    }, [reveal, claimedHash]);

    return (
        <div className="predictions">
            <div className="predictions__heading">PREDICTION COMMITMENT</div>
            <div className="predictions__subheading">
                write a prediction, hash it with sha-256, and post the hash. when it comes true,
                reveal the text — it matches the hash you posted. leading/trailing whitespace is
                trimmed, everything else is hashed exactly as typed (utf-8 bytes).
            </div>

            <section className="predictions__panel" aria-labelledby="predictions-commit-title">
                <h2 className="predictions__panel-title" id="predictions-commit-title">commit</h2>

                <label className="predictions__label" htmlFor="prediction-input">&gt; prediction</label>
                <textarea
                    id="prediction-input"
                    className="predictions__input"
                    rows={4}
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                    placeholder="the ft publishes another one of my letters before 2028"
                    spellCheck={false}
                />
                <div className="predictions__meta">
                    {byteLength(committed)} bytes (utf-8, trimmed)
                </div>

                <div className="predictions__label">&gt; sha-256</div>
                <div
                    className={'predictions__hash' + (hash ? '' : ' predictions__hash--empty')}
                    aria-live="polite"
                >
                    {hash || '—'}
                </div>

                <div className="predictions__actions">
                    <CopyButton label="Copy prediction" value={committed} />
                    <CopyButton label="Copy hash" value={hash} />
                    <button
                        type="button"
                        className="predictions-btn"
                        onClick={() => setPrediction('')}
                        disabled={!prediction}
                    >
                        <Eraser size={14} aria-hidden="true" />
                        <span>Clear</span>
                    </button>
                </div>
            </section>

            <section className="predictions__panel" aria-labelledby="predictions-verify-title">
                <h2 className="predictions__panel-title" id="predictions-verify-title">verify a reveal</h2>

                <label className="predictions__label" htmlFor="reveal-input">&gt; revealed prediction</label>
                <textarea
                    id="reveal-input"
                    className="predictions__input"
                    rows={3}
                    value={reveal}
                    onChange={(e) => setReveal(e.target.value)}
                    placeholder="paste the revealed prediction"
                    spellCheck={false}
                />

                <label className="predictions__label" htmlFor="claimed-hash-input">&gt; posted sha-256 hash</label>
                <input
                    id="claimed-hash-input"
                    className="predictions__input"
                    type="text"
                    value={claimedHash}
                    onChange={(e) => setClaimedHash(e.target.value)}
                    placeholder="64 hex characters"
                    spellCheck={false}
                    autoComplete="off"
                />

                <div
                    className={'predictions__verdict' + (verdict ? ` predictions__verdict--${verdict}` : '')}
                    aria-live="polite"
                >
                    {verdict === 'match' && (
                        <>
                            <ShieldCheck size={15} aria-hidden="true" />
                            <span>MATCH — this text hashes to the posted hash</span>
                        </>
                    )}
                    {verdict === 'mismatch' && (
                        <>
                            <XCircle size={15} aria-hidden="true" />
                            <span>NO MATCH — this text does not hash to that value</span>
                        </>
                    )}
                    {verdict === 'invalid' && <span>not a sha-256 hash — expected 64 hex characters</span>}
                </div>
            </section>
        </div>
    );
};

export default Predictions;
