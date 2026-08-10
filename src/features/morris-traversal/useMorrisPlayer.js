import { useEffect, useReducer } from 'react';

// Index-based player for the precomputed trace; stepping back just renders
// the previous snapshot. Autoplay chains setTimeout through an effect.

const BASE_DELAY_MS = 1200;

const initialState = { stepIndex: 0, isPlaying: false, speed: 1 };

const createReducer = (maxIndex) => (state, action) => {
    switch (action.type) {
        case 'TOGGLE':
            // Pressing play at the end restarts from the beginning
            if (!state.isPlaying && state.stepIndex >= maxIndex) {
                return { ...state, stepIndex: 0, isPlaying: true };
            }
            return { ...state, isPlaying: !state.isPlaying };
        case 'PAUSE':
            return { ...state, isPlaying: false };
        case 'TICK': {
            if (state.stepIndex >= maxIndex) return { ...state, isPlaying: false };
            const next = state.stepIndex + 1;
            // stop playback on the final snapshot so play-at-end restarts cleanly
            return { ...state, stepIndex: next, isPlaying: next < maxIndex };
        }
        case 'STEP_FWD':
            return {
                ...state,
                isPlaying: false,
                stepIndex: Math.min(state.stepIndex + 1, maxIndex),
            };
        case 'STEP_BACK':
            return {
                ...state,
                isPlaying: false,
                stepIndex: Math.max(state.stepIndex - 1, 0),
            };
        case 'RESET':
            return { ...state, isPlaying: false, stepIndex: 0 };
        case 'END':
            return { ...state, isPlaying: false, stepIndex: maxIndex };
        case 'SET_SPEED':
            return { ...state, speed: action.speed };
        default:
            return state;
    }
};

// A new trace (new tree) resets the player.
export const useMorrisPlayer = (trace) => {
    const maxIndex = trace.length - 1;
    const [state, dispatch] = useReducer(createReducer(maxIndex), initialState);

    useEffect(() => {
        dispatch({ type: 'RESET' });
    }, [trace]);

    // autoplay: one timeout per step, cleaned up on deps change/unmount
    useEffect(() => {
        if (!state.isPlaying) return undefined;
        if (state.stepIndex >= maxIndex) return undefined;
        const timeout = setTimeout(
            () => dispatch({ type: 'TICK' }),
            BASE_DELAY_MS / state.speed,
        );
        return () => clearTimeout(timeout);
    }, [state.isPlaying, state.stepIndex, state.speed, maxIndex]);

    // Keyboard controls: Space = play/pause, arrows = step, Home/End = jump.
    useEffect(() => {
        const handleKeyDown = (e) => {
            const target = e.target;
            // Never steal keys from text-entry contexts
            const typing =
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    target.closest('input, textarea, select'));
            // Buttons/links keep native Space activation (avoids double-toggle)
            const onButtonLike =
                target instanceof HTMLElement && target.closest('button, a');
            switch (e.key) {
                case ' ':
                    if (typing || onButtonLike) return;
                    e.preventDefault();
                    dispatch({ type: 'TOGGLE' });
                    break;
                case 'ArrowRight':
                    if (typing) return;
                    e.preventDefault();
                    dispatch({ type: 'STEP_FWD' });
                    break;
                case 'ArrowLeft':
                    if (typing) return;
                    e.preventDefault();
                    dispatch({ type: 'STEP_BACK' });
                    break;
                case 'Home':
                    if (typing) return;
                    e.preventDefault();
                    dispatch({ type: 'RESET' });
                    break;
                case 'End':
                    if (typing) return;
                    e.preventDefault();
                    dispatch({ type: 'END' });
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return [state, dispatch];
};
