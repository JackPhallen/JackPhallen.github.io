import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    RotateCcw,
    Shuffle,
    SkipForward,
} from 'lucide-react';
import { generateTree, layoutTree, NODE_R } from './tree';
import { buildTrace } from './trace';
import { PSEUDOCODE } from './pseudocode';
import { useMorrisPlayer } from './useMorrisPlayer';
import './morris-traversal.css';

const SPEEDS = [0.5, 1, 2];
const RING_OFFSET = 8;

// curved line from `from` to `to`, bowed away from the tree centerline
// and trimmed to the node borders so the arrowhead clears the circles.
const threadPath = (from, to, centerX) => {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // pick the control point farther from the centerline so threads bow outward
    const bend = 0.45;
    const c1 = { x: mx - dy * bend, y: my + dx * bend };
    const c2 = { x: mx + dy * bend, y: my - dx * bend };
    const c = Math.abs(c1.x - centerX) >= Math.abs(c2.x - centerX) ? c1 : c2;

    const trim = (p) => {
        const vx = c.x - p.x;
        const vy = c.y - p.y;
        const len = Math.hypot(vx, vy) || 1;
        return {
            x: p.x + (vx / len) * (NODE_R + 2),
            y: p.y + (vy / len) * (NODE_R + 2),
        };
    };
    const s = trim(from);
    const e = trim(to);
    return `M ${s.x} ${s.y} Q ${c.x} ${c.y} ${e.x} ${e.y}`;
};

const MorrisTraversal = () => {
    const [tree, setTree] = useState(generateTree);
    const layout = useMemo(() => layoutTree(tree), [tree]);
    const trace = useMemo(() => buildTrace(tree, layout.byValue), [tree, layout.byValue]);
    const [player, dispatch] = useMorrisPlayer(trace);
    const markerUid = useId().replace(/:/g, '');
    const scrollRef = useRef(null);

    const maxIndex = trace.length - 1;
    // clamp: a stale stepIndex must never index past a shorter new trace
    const step = trace[Math.min(player.stepIndex, maxIndex)];
    const atStart = player.stepIndex === 0;
    const atEnd = player.stepIndex === maxIndex;

    // batch the reset with the new tree so no render pairs a stale index with the new trace
    const handleNewTree = () => {
        setTree(generateTree());
        dispatch({ type: 'RESET' });
    };

    // start each new tree at its left edge
    useEffect(() => {
        scrollRef.current?.scrollTo({ left: 0 });
    }, [layout]);

    // keep the focus node in view when the tree is wider than the viewport
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || el.scrollWidth <= el.clientWidth) return;
        const focusValue = step.curr ?? step.pred ?? step.justVisited;
        if (focusValue === null) return;
        const node = layout.byValue.get(focusValue);
        if (!node) return;
        const viewBoxWidth = layout.width + 72; // viewBox starts at x = -72
        const nodePx = (node.x + 72) * (el.scrollWidth / viewBoxWidth);
        const EDGE = 48;
        const visibleLeft = el.scrollLeft;
        const visibleRight = visibleLeft + el.clientWidth;
        let target = null;
        if (nodePx < visibleLeft + EDGE) {
            target = nodePx - el.clientWidth * 0.35;
        } else if (nodePx > visibleRight - EDGE) {
            target = nodePx - el.clientWidth * 0.65;
        }
        if (target !== null) {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            el.scrollTo({
                left: Math.max(0, target),
                behavior: reduce ? 'auto' : 'smooth',
            });
        }
    }, [step, layout]);

    const edges = useMemo(() => {
        const list = [];
        for (const node of layout.nodes) {
            if (node.left) list.push([node, node.left]);
            if (node.right) list.push([node, node.right]);
        }
        return list;
    }, [layout.nodes]);

    const isPredEdge = (parent, child) =>
        step.predEdge && step.predEdge[0] === parent.value && step.predEdge[1] === child.value;

    const isActiveThread = (from, to) =>
        step.activeThread && step.activeThread[0] === from && step.activeThread[1] === to;

    const visitedSet = useMemo(() => new Set(step.visited), [step.visited]);

    return (
        <div className="morris">
            <div className="morris__layout">
                <div className="morris__main">
                    <div className="morris__tree-scroll" ref={scrollRef}>
                        <div className="morris__tree-inner">
                            <svg
                                viewBox={`-72 -16 ${layout.width + 72} ${layout.height + 16}`}
                                width="100%"
                                role="img"
                                aria-label="Binary tree being traversed with Morris traversal"
                            >
                                <defs>
                                    <marker
                                        id={`morris-arrow-thread-${markerUid}`}
                                        viewBox="0 0 10 10"
                                        refX="8"
                                        refY="5"
                                        markerWidth="9"
                                        markerHeight="9"
                                        markerUnits="userSpaceOnUse"
                                        orient="auto-start-reverse"
                                    >
                                        <path d="M 0 1 L 9 5 L 0 9 z" className="morris-marker-thread" />
                                    </marker>
                                    <marker
                                        id={`morris-arrow-link-${markerUid}`}
                                        viewBox="0 0 10 10"
                                        refX="8"
                                        refY="5"
                                        markerWidth="8"
                                        markerHeight="8"
                                        markerUnits="userSpaceOnUse"
                                        orient="auto-start-reverse"
                                    >
                                        <path d="M 0 1 L 9 5 L 0 9 z" className="morris-marker-link" />
                                    </marker>
                                </defs>

                                {/* real edges */}
                                {edges.map(([parent, child]) => (
                                    <line
                                        key={`e-${parent.value}-${child.value}`}
                                        x1={parent.x}
                                        y1={parent.y}
                                        x2={child.x}
                                        y2={child.y}
                                        className={
                                            'morris-edge' +
                                            (isPredEdge(parent, child) ? ' morris-edge--pred' : '')
                                        }
                                    />
                                ))}

                                {/* threads */}
                                {step.threads.map(([from, to]) => (
                                    <path
                                        key={`t-${from}-${to}`}
                                        d={threadPath(layout.byValue.get(from), layout.byValue.get(to), layout.centerX)}
                                        markerEnd={`url(#morris-arrow-thread-${markerUid})`}
                                        className={
                                            'morris-thread' +
                                            (isActiveThread(from, to) ? ' morris-thread--active' : '')
                                        }
                                    />
                                ))}

                                {/* flattened output row */}
                                <text x={-10} y={layout.outputY + 4} textAnchor="end" className="morris-output-label">
                                    output:
                                </text>
                                {step.visited.map((value, i) => {
                                    const node = layout.byValue.get(value);
                                    const prev = i > 0 ? layout.byValue.get(step.visited[i - 1]) : null;
                                    return (
                                        <g key={`o-${value}`}>
                                            {prev && (
                                                <line
                                                    x1={prev.x + 13}
                                                    y1={layout.outputY}
                                                    x2={node.x - 13}
                                                    y2={layout.outputY}
                                                    className="morris-link"
                                                    markerEnd={`url(#morris-arrow-link-${markerUid})`}
                                                />
                                            )}
                                            <circle
                                                cx={node.x}
                                                cy={layout.outputY}
                                                r={13}
                                                className={
                                                    'morris-chip' +
                                                    (step.justVisited === value ? ' morris-chip--new' : '')
                                                }
                                            />
                                            <text x={node.x} y={layout.outputY + 4} className="morris-chip__text">
                                                {value}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* connector dropping the visited node into the output row */}
                                {step.justVisited !== null && (
                                    <line
                                        x1={layout.byValue.get(step.justVisited).x}
                                        y1={layout.byValue.get(step.justVisited).y + NODE_R + 3}
                                        x2={layout.byValue.get(step.justVisited).x}
                                        y2={layout.outputY - 16}
                                        className="morris-drop"
                                    />
                                )}

                                {/* nodes */}
                                {layout.nodes.map((node) => (
                                    <g key={`n-${node.value}`}>
                                        {step.justVisited === node.value && (
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={NODE_R + 4}
                                                className="morris-node__halo"
                                            />
                                        )}
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={NODE_R}
                                            className={
                                                'morris-node' +
                                                (visitedSet.has(node.value) ? ' morris-node--visited' : '')
                                            }
                                        />
                                        <text x={node.x} y={node.y + 5} className="morris-node__text">
                                            {node.value}
                                        </text>
                                    </g>
                                ))}

                                {/* pointer rings + labels, drawn on top */}
                                {step.pred !== null && (
                                    <g className="morris-pointer">
                                        <circle
                                            cx={layout.byValue.get(step.pred).x}
                                            cy={layout.byValue.get(step.pred).y}
                                            r={NODE_R + RING_OFFSET}
                                            className="morris-ring morris-ring--pred"
                                        />
                                        <text
                                            x={layout.byValue.get(step.pred).x}
                                            y={layout.byValue.get(step.pred).y + NODE_R + RING_OFFSET + 15}
                                            className="morris-ring__label morris-ring__label--pred"
                                        >
                                            pred
                                        </text>
                                    </g>
                                )}
                                {step.curr !== null && (
                                    <g className="morris-pointer">
                                        <circle
                                            cx={layout.byValue.get(step.curr).x}
                                            cy={layout.byValue.get(step.curr).y}
                                            r={NODE_R + RING_OFFSET}
                                            className="morris-ring morris-ring--curr"
                                        />
                                        <text
                                            x={layout.byValue.get(step.curr).x}
                                            y={layout.byValue.get(step.curr).y - NODE_R - RING_OFFSET - 7}
                                            className="morris-ring__label morris-ring__label--curr"
                                        >
                                            curr
                                        </text>
                                    </g>
                                )}
                            </svg>
                        </div>
                    </div>

                    {/* muted during autoplay so rapid steps don't flood screen readers */}
                    <p className="morris__desc" aria-live={player.isPlaying ? 'off' : 'polite'}>
                        <span className="morris__desc-prefix" aria-hidden="true">&gt;</span> {step.desc}
                    </p>

                    {/* Controls */}
                    <div className="morris__controls">
                        <div className="morris__controls-group">
                            <button
                                type="button"
                                className="morris-btn"
                                onClick={() => dispatch({ type: 'RESET' })}
                                disabled={atStart}
                                aria-label="Reset to start"
                                title="Reset to start [Home]"
                            >
                                <RotateCcw size={14} aria-hidden="true" />
                                <span>Reset</span>
                            </button>
                            <button
                                type="button"
                                className="morris-btn"
                                onClick={() => dispatch({ type: 'STEP_BACK' })}
                                disabled={atStart}
                                aria-label="Step back"
                                title="Step back [←]"
                            >
                                <ChevronLeft size={14} aria-hidden="true" />
                                <span>Step</span>
                            </button>
                            <button
                                type="button"
                                className="morris-btn morris-btn--primary"
                                onClick={() => dispatch({ type: 'TOGGLE' })}
                                aria-label={player.isPlaying ? 'Pause' : 'Play'}
                                title="Play/Pause [Space]"
                            >
                                {player.isPlaying ? (
                                    <Pause size={14} aria-hidden="true" />
                                ) : (
                                    <Play size={14} aria-hidden="true" />
                                )}
                                <span>{player.isPlaying ? 'Pause' : 'Play'}</span>
                            </button>
                            <button
                                type="button"
                                className="morris-btn"
                                onClick={() => dispatch({ type: 'STEP_FWD' })}
                                disabled={atEnd}
                                aria-label="Step forward"
                                title="Step forward [→]"
                            >
                                <span>Step</span>
                                <ChevronRight size={14} aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="morris-btn"
                                onClick={() => dispatch({ type: 'END' })}
                                disabled={atEnd}
                                aria-label="Skip to end"
                                title="Skip to end [End]"
                            >
                                <SkipForward size={14} aria-hidden="true" />
                                <span>End</span>
                            </button>
                        </div>

                        <div className="morris__controls-group">
                            <span className="morris__step-count">
                                Step {player.stepIndex}/{maxIndex}
                            </span>
                            <div className="morris__speed" role="group" aria-label="Playback speed">
                                {SPEEDS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={
                                            'morris-btn morris-btn--speed' +
                                            (player.speed === s ? ' morris-btn--active' : '')
                                        }
                                        onClick={() => dispatch({ type: 'SET_SPEED', speed: s })}
                                        aria-pressed={player.speed === s}
                                    >
                                        {s}×
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="morris-btn"
                                onClick={handleNewTree}
                                title="Generate a new random tree"
                            >
                                <Shuffle size={14} aria-hidden="true" />
                                <span>New tree</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* pseudocode + legend */}
                <aside className="morris__side">
                    <div className="morris__panel">
                        <h2 className="morris__panel-title">morris_traversal.py</h2>
                        <ol className="morris-code">
                            {PSEUDOCODE.map((line, i) => (
                                <li
                                    key={i}
                                    className={
                                        'morris-code__line' +
                                        (step.codeLine === i + 1 ? ' morris-code__line--active' : '')
                                    }
                                >
                                    <span className="morris-code__num">{i + 1}</span>
                                    <span className="morris-code__text">{line}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="morris__panel">
                        <h2 className="morris__panel-title">legend</h2>
                        <ul className="morris-legend">
                            <li>
                                <span className="morris-legend__swatch morris-legend__swatch--curr" aria-hidden="true" />
                                curr — node being processed
                            </li>
                            <li>
                                <span className="morris-legend__swatch morris-legend__swatch--pred" aria-hidden="true" />
                                pred — predecessor search pointer
                            </li>
                            <li>
                                <span className="morris-legend__swatch morris-legend__swatch--thread" aria-hidden="true" />
                                thread — temporary shortcut
                            </li>
                            <li>
                                <span className="morris-legend__swatch morris-legend__swatch--visited" aria-hidden="true" />
                                visited — emitted to output
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default memo(MorrisTraversal);
