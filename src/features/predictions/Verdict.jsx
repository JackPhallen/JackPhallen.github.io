import { Info, ShieldCheck, XCircle } from 'lucide-react';

const ICONS = { good: ShieldCheck, bad: XCircle, note: Info };

const Verdict = ({ tone = null, children }) => {
    const Icon = tone && ICONS[tone];
    return (
        <div
            className={'predictions__verdict' + (tone ? ` predictions__verdict--${tone}` : '')}
            aria-live="polite"
        >
            {Icon && <Icon size={15} aria-hidden="true" />}
            {tone && <span>{children}</span>}
        </div>
    );
};

export default Verdict;
