import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Lock, RotateCcw } from 'lucide-react';
import Card from './Card';
import CopyButton, { ManualCopy } from './CopyButton';
import VerifyHash from './VerifyHash';
import { buildLink, hashPrediction, MAX_PREDICTION, MAX_TITLE } from './link';

const STEPS = ['write', 'save', 'share'];

const StepIndicator = ({ step }) => (
    <ol className="predictions__steps" aria-label="steps">
        {STEPS.map((name, i) => (
            <li
                key={name}
                className={'predictions__step' + (name === step ? ' predictions__step--active' : '')}
                aria-current={name === step ? 'step' : undefined}
            >
                [{i + 1}] {name}
            </li>
        ))}
        {step !== 'write' && <li className="predictions__step predictions__step--hint" aria-hidden="true">esc: back</li>}
    </ol>
);

const Create = () => {
    const [step, setStep] = useState('write');
    const [title, setTitle] = useState('');
    const [prediction, setPrediction] = useState('');
    const [createdAt, setCreatedAt] = useState(null);
    const [saved, setSaved] = useState(false);
    const [manualCopy, setManualCopy] = useState(null);
    const [editing, setEditing] = useState(false);

    const text = prediction.trim();
    const hash = useMemo(() => (text ? hashPrediction(text) : ''), [text]);
    const commitment = { hash, title: title.trim(), createdAt };
    const shareLink = createdAt ? buildLink(commitment) : '';
    const revealLink = createdAt ? buildLink({ ...commitment, text }) : '';

    const goTo = (next) => {
        setManualCopy(null);
        setStep(next);
    };

    const lockIn = () => {
        setCreatedAt(new Date());
        setSaved(false);
        goTo('save');
    };

    const backToWrite = () => {
        setEditing(true);
        goTo('write');
    };

    const startOver = () => {
        setTitle('');
        setPrediction('');
        setCreatedAt(null);
        setEditing(false);
        goTo('write');
    };

    useEffect(() => {
        if (step === 'write') return undefined;
        const handleKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            setManualCopy(null);
            if (step === 'share') {
                setStep('save');
            } else {
                setEditing(true);
                setStep('write');
            }
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [step]);

    return (
        <div className="predictions">
            <div className="predictions__heading">PREDICTION COMMITMENT</div>
            <StepIndicator step={step} />

            {step === 'write' && (
                <>
                    <section className="predictions__panel">
                        <label className="predictions__label" htmlFor="title-input">
                            &gt; public title <span className="predictions__optional">(optional, shown on the card)</span>
                        </label>
                        <input
                            id="title-input"
                            className="predictions__input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="my next ft letter"
                            maxLength={MAX_TITLE}
                            autoComplete="off"
                        />

                        <label className="predictions__label" htmlFor="prediction-input">
                            &gt; prediction <span className="predictions__optional">(secret until you reveal it)</span>
                        </label>
                        <textarea
                            id="prediction-input"
                            className="predictions__input"
                            rows={4}
                            value={prediction}
                            onChange={(e) => setPrediction(e.target.value)}
                            placeholder="the ft publishes another one of my letters before 2028"
                            maxLength={MAX_PREDICTION}
                            spellCheck={false}
                            autoFocus={editing}
                        />
                        <div className="predictions__meta">{prediction.length}/{MAX_PREDICTION}</div>

                        <div className="predictions__actions">
                            <button
                                type="button"
                                className="predictions-btn predictions-btn--primary"
                                onClick={lockIn}
                                disabled={!text}
                            >
                                <Lock size={14} aria-hidden="true" />
                                <span>Lock it in</span>
                            </button>
                        </div>
                    </section>

                    <VerifyHash />
                </>
            )}

            {step === 'save' && (
                <section className="predictions__panel">
                    <div className="predictions__label">&gt; exactly what gets hashed</div>
                    <div className="predictions__text">{text}</div>

                    <p className="predictions__warning">
                        nothing is stored. save your reveal link somewhere private — it's the only
                        copy, and you'll send it when you're right.
                    </p>

                    <div className="predictions__actions">
                        <CopyButton
                            label="Copy reveal link"
                            value={revealLink}
                            onCopied={() => setSaved(true)}
                            onFailed={setManualCopy}
                            primary
                            autoFocus
                        />
                        <CopyButton
                            label="Copy text only"
                            value={text}
                            onCopied={() => setSaved(true)}
                            onFailed={setManualCopy}
                        />
                    </div>
                    {manualCopy && <ManualCopy value={manualCopy} onCopied={() => setSaved(true)} />}

                    <div className="predictions__actions predictions__actions--nav">
                        <button type="button" className="predictions-btn" onClick={backToWrite}>
                            <ArrowLeft size={14} aria-hidden="true" />
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            className="predictions-btn predictions-btn--primary"
                            onClick={() => goTo('share')}
                            disabled={!saved}
                        >
                            <span>I saved it</span>
                            <ArrowRight size={14} aria-hidden="true" />
                        </button>
                    </div>
                </section>
            )}

            {step === 'share' && (
                <>
                    <Card {...commitment} />
                    <div className="predictions__actions">
                        <CopyButton
                            label="Copy share link"
                            value={shareLink}
                            onFailed={setManualCopy}
                            primary
                            autoFocus
                        />
                        <a className="predictions-btn" href={shareLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} aria-hidden="true" />
                            <span>Open it</span>
                        </a>
                        <CopyButton label="Copy reveal link again" value={revealLink} onFailed={setManualCopy} />
                        <button type="button" className="predictions-btn" onClick={startOver}>
                            <RotateCcw size={14} aria-hidden="true" />
                            <span>Start over</span>
                        </button>
                    </div>
                    {manualCopy && <ManualCopy value={manualCopy} />}
                    <div className="predictions__meta">send this now · send your reveal link when you're right</div>
                </>
            )}
        </div>
    );
};

export default Create;
