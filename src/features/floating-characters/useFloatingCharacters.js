import { useEffect } from 'react';
import { TIMER_INTERVAL } from './config';
import { createState } from './engine/state';
import { createRenderer } from './engine/renderer';
import { updateCharacter, applyClickRipple, rerollHoverRanges, switchRandomModes } from './engine/physics';
import { createResizeHandler } from './engine/resize';
import { IntervalScheduler } from './engine/scheduler';

export const useFloatingCharacters = (canvasRef) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const ctx = canvas.getContext('2d');
        const state = createState(window.innerWidth, window.innerHeight);
        const renderer = createRenderer(ctx);

        // physics run in CSS pixels; the DPR transform keeps text crisp on HiDPI
        const sizeCanvas = (width, height) => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        sizeCanvas(state.width, state.height);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // reduced motion: one static frame, redraw on resize only
        if (prefersReducedMotion) {
            const drawStaticFrame = () => {
                renderer.clear(state.width, state.height);
                for (const char of state.characters) {
                    renderer.drawCharacter(char);
                }
            };
            drawStaticFrame();

            const handleResize = createResizeHandler(state, { sizeCanvas, afterResize: drawStaticFrame });
            window.addEventListener('resize', handleResize);
            return () => {
                handleResize.cancel();
                window.removeEventListener('resize', handleResize);
            };
        }

        const handleMouseMove = (event) => {
            state.mouse.x = event.clientX;
            state.mouse.y = event.clientY;
        };
        const handleClick = (event) => applyClickRipple(state, event.clientX, event.clientY);
        const handleResize = createResizeHandler(state, { sizeCanvas });

        // on window, not canvas, so tracking survives the menu overlay covering the cursor
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvas.addEventListener('click', handleClick);
        window.addEventListener('resize', handleResize);

        const scheduler = new IntervalScheduler(TIMER_INTERVAL);
        scheduler.add('boundaryUpdate', () => rerollHoverRanges(state));
        scheduler.add('modeSwitch', () => switchRandomModes(state));

        let animationFrameId = null;
        const animate = () => {
            renderer.clear(state.width, state.height);
            for (const char of state.characters) {
                updateCharacter(char, state);
                renderer.drawCharacter(char);
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            scheduler.stop();
            handleResize.cancel();
            window.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
        };
    }, [canvasRef]);
};
