import { classifyPaste, hashPrediction } from './link';

const PARTIAL_HEX = /^[0-9a-f]{1,63}$/i;
const CUT_OFF = { tone: 'note', message: "can't read that link — it may have been cut off. paste the whole link" };

export const checkReveal = (value, expectedHash) => {
    const paste = classifyPaste(value);
    switch (paste.kind) {
        case 'empty':
            return null;
        case 'share':
            return { tone: 'note', message: "that's a share link — paste the reveal link or the revealed text" };
        case 'hash':
            return { tone: 'note', message: "that's a hash — paste the revealed text or the reveal link" };
        case 'broken':
            return CUT_OFF;
        default:
            return hashPrediction(paste.text) === expectedHash
                ? { tone: 'good', message: 'MATCH — this is the prediction behind the hash' }
                : { tone: 'bad', message: 'NO MATCH — this text does not produce that hash' };
    }
};

export const checkEarlier = (value, currentHash) => {
    const paste = classifyPaste(value);
    switch (paste.kind) {
        case 'empty':
            return null;
        case 'reveal':
            return { tone: 'note', message: "that's the reveal link — paste the share link you got before" };
        case 'broken':
            return CUT_OFF;
        case 'share':
        case 'hash':
            return paste.hash === currentHash
                ? { tone: 'good', message: 'SAME HASH — this is the prediction you were sent' }
                : { tone: 'bad', message: "DIFFERENT HASH — this isn't the prediction you were sent" };
        default:
            if (PARTIAL_HEX.test(value.trim())) return null;
            return { tone: 'note', message: 'paste the share link you got before, or its hash' };
    }
};

export const readHash = (value) => {
    const paste = classifyPaste(value);
    if (paste.kind === 'share' || paste.kind === 'hash' || paste.kind === 'reveal') return { hash: paste.hash };
    if (paste.kind === 'empty' || PARTIAL_HEX.test(value.trim())) return { hash: '' };
    if (paste.kind === 'broken') return { hash: '', result: CUT_OFF };
    return { hash: '', result: { tone: 'note', message: 'not a sha-256 hash — expected 64 hex characters' } };
};
