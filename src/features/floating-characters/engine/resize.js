import { RESIZE_DEBOUNCE_TIME } from '../config';
import { debounce } from '../utils';
import { spawnCharacter, targetCharacterCount } from './state';

const remapPositions = (state, scaleX, scaleY) => {
    for (const char of state.characters) {
        char.x *= scaleX;
        char.baseX *= scaleX;
        char.y *= scaleY;
        char.baseY *= scaleY;
        if (char.rippleEndX !== null) {
            char.rippleEndX *= scaleX;
            char.rippleEndY *= scaleY;
        }
        if (char.targetBaseX !== null) {
            char.targetBaseX *= scaleX;
            char.targetBaseY *= scaleY;
        }
    }
};

const adjustPopulation = (state) => {
    const target = targetCharacterCount(state.width, state.height);
    const { characters } = state;

    while (characters.length < target) {
        characters.push(spawnCharacter(state.width, state.height));
    }
    while (characters.length > target) {
        characters.splice(Math.floor(Math.random() * characters.length), 1);
    }
};

export const createResizeHandler = (state, { sizeCanvas, afterResize }) =>
    debounce(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        if (newWidth === state.width && newHeight === state.height) return;

        const scaleX = newWidth / state.width;
        const scaleY = newHeight / state.height;

        remapPositions(state, scaleX, scaleY);
        state.width = newWidth;
        state.height = newHeight;
        sizeCanvas(newWidth, newHeight);
        adjustPopulation(state);

        if (afterResize) afterResize();
    }, RESIZE_DEBOUNCE_TIME);
