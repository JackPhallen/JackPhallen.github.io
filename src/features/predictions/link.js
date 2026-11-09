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

const toBase64Url = (text) => {
    let binary = '';
    new TextEncoder().encode(text).forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value) => {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
};

export const buildLink = ({ hash, title, createdAt, text }) => {
    const fields = { h: hash, c: createdAt.toISOString().slice(0, 16) + 'Z' };
    if (title) fields.t = title;
    if (text !== undefined) fields.p = text;
    return `${window.location.origin}${PATH}?d=${toBase64Url(JSON.stringify(fields))}`;
};

const readFields = (raw) => {
    try {
        const fields = JSON.parse(fromBase64Url(raw));
        return fields && typeof fields === 'object' ? fields : {};
    } catch {
        return {};
    }
};

const asString = (value) => (typeof value === 'string' ? value : null);

export const parseLink = (search) => {
    const raw = new URLSearchParams(search).get('d');
    if (raw === null) return null;
    const fields = readFields(raw);
    const hash = normalizeHash(asString(fields.h) ?? '');
    const c = asString(fields.c) ?? '';
    const created = CREATED_FORMAT.test(c) ? new Date(c) : null;
    return {
        valid: isHash(hash),
        hash,
        title: (asString(fields.t) ?? '').trim().slice(0, MAX_TITLE),
        createdAt: created && !Number.isNaN(created.getTime()) ? created : null,
        text: asString(fields.p),
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
        const link = parseLink(url.search);
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
