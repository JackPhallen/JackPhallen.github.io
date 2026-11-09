import { sha256 } from 'js-sha256';

export const MAX_PREDICTION = 500;
export const MAX_TITLE = 120;

const HEX64 = /^[0-9a-f]{64}$/;
const CREATED_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;
const PATH = '/fun/predictions';

export const hashPrediction = (text) => sha256(text.trim());

export const normalizeHash = (value) => value.trim().toLowerCase().replace(/^sha256:/, '');
export const isHash = (value) => HEX64.test(value);

export const formatUtc = (date) => date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

export const buildLink = ({ hash, title, createdAt, text }) => {
    const params = new URLSearchParams();
    params.set('h', hash);
    if (title) params.set('t', title);
    params.set('c', createdAt.toISOString().slice(0, 16) + 'Z');
    if (text !== undefined) params.set('p', text);
    return `${window.location.origin}${PATH}#${params}`;
};

export const parseLink = (fragment) => {
    const raw = fragment.replace(/^#/, '');
    if (!raw) return null;
    const params = new URLSearchParams(raw);
    const hash = normalizeHash(params.get('h') ?? '');
    const c = params.get('c') ?? '';
    const created = CREATED_FORMAT.test(c) ? new Date(c) : null;
    return {
        valid: isHash(hash),
        hash,
        title: (params.get('t') ?? '').trim().slice(0, MAX_TITLE),
        createdAt: created && !Number.isNaN(created.getTime()) ? created : null,
        text: params.get('p'),
    };
};

const toUrl = (value) => {
    try {
        return new URL(value);
    } catch {
        return null;
    }
};

export const classifyPaste = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return { kind: 'empty' };

    const url = toUrl(trimmed);
    if (url && url.pathname.replace(/\/$/, '').endsWith(PATH)) {
        const link = parseLink(url.hash);
        if (link?.text != null) {
            if (!link.valid || hashPrediction(link.text) !== link.hash) return { kind: 'broken' };
            return { kind: 'reveal', text: link.text, hash: link.hash };
        }
        if (link?.valid) return { kind: 'share', hash: link.hash };
        return { kind: 'broken' };
    }

    const hash = normalizeHash(trimmed);
    if (isHash(hash)) return { kind: 'hash', hash };
    return { kind: 'text', text: value };
};
