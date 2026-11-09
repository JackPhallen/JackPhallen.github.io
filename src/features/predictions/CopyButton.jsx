import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

const copyText = async (value) => {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false;
    }
};

const LABELS = { copied: 'Copied', failed: "Couldn't copy" };

const CopyButton = ({ label, value, onCopied, onFailed, primary = false, autoFocus = false }) => {
    const [status, setStatus] = useState('idle');
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleCopy = async () => {
        const ok = await copyText(value);
        setStatus(ok ? 'copied' : 'failed');
        if (ok) onCopied?.();
        else onFailed?.(value);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setStatus('idle'), 1500);
    };

    return (
        <button
            type="button"
            className={'predictions-btn' + (primary ? ' predictions-btn--primary' : '')}
            onClick={handleCopy}
            disabled={!value}
            autoFocus={autoFocus}
        >
            {status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            <span>{LABELS[status] ?? label}</span>
        </button>
    );
};

export const ManualCopy = ({ value, onCopied }) => (
    <div>
        <label className="predictions__label" htmlFor="manual-copy">
            &gt; copying was blocked — select this and copy it yourself
        </label>
        <textarea
            id="manual-copy"
            className="predictions__input predictions__input--manual"
            rows={3}
            value={value}
            readOnly
            autoFocus
            onFocus={(e) => e.target.select()}
            onCopy={() => onCopied?.()}
        />
    </div>
);

export default CopyButton;
