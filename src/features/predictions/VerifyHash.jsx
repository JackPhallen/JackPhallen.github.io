import { useState } from 'react';
import Verdict from './Verdict';
import { checkReveal, readHash } from './checks';

const VerifyHash = () => {
    const [claimedHash, setClaimedHash] = useState('');
    const [text, setText] = useState('');

    const { hash, result: hashProblem } = readHash(claimedHash);
    const result = hashProblem ?? (hash ? checkReveal(text, hash) : null);

    return (
        <details className="predictions__details">
            <summary className="predictions__summary">only have a screenshot? verify a hash</summary>

            <label className="predictions__label" htmlFor="verify-hash-input">&gt; sha-256 hash</label>
            <input
                id="verify-hash-input"
                className="predictions__input"
                type="text"
                value={claimedHash}
                onChange={(e) => setClaimedHash(e.target.value)}
                placeholder="64 hex characters"
                spellCheck={false}
                autoComplete="off"
            />

            <label className="predictions__label" htmlFor="verify-text-input">&gt; revealed prediction</label>
            <textarea
                id="verify-text-input"
                className="predictions__input"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="paste the text or the reveal link"
                spellCheck={false}
            />

            <Verdict tone={result?.tone}>{result?.message}</Verdict>
        </details>
    );
};

export default VerifyHash;
