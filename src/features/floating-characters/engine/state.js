import {
    CHARACTER_SET,
    CHARACTER_RGB,
    FONT_FAMILY,
    MIN_CHAR_SIZE,
    MAX_CHAR_SIZE,
    MIN_DEPTH,
    MAX_DEPTH,
    MIN_MOVEMENT_SPEED,
    MAX_MOVEMENT_SPEED,
    MIN_RANGE_X,
    MAX_RANGE_X,
    MIN_RANGE_Y,
    MAX_RANGE_Y,
    DRIFTING_SPEED_MIN,
    DRIFTING_SPEED_MAX,
    DRIFTING_PERCENTAGE,
    CHARACTER_SPACING,
    DENSITY_FACTOR,
} from '../config';
import { randomBetween, vectorFromAngle } from '../utils';

export const createHoveringCharacter = (x, y) => {
    const char = CHARACTER_SET[Math.floor(Math.random() * CHARACTER_SET.length)];
    const size = randomBetween(MIN_CHAR_SIZE, MAX_CHAR_SIZE);
    const depth = randomBetween(MIN_DEPTH, MAX_DEPTH);
    const normalPhaseSpeed = randomBetween(MIN_MOVEMENT_SPEED, MAX_MOVEMENT_SPEED);

    return {
        char,
        size,
        depth,
        // precomputed to avoid per-frame allocation
        color: `rgba(${CHARACTER_RGB}, ${depth})`,
        font: `${size}px ${FONT_FAMILY}`,
        x,
        y,
        baseX: x,
        baseY: y,
        rangeX: randomBetween(MIN_RANGE_X, MAX_RANGE_X),
        rangeY: randomBetween(MIN_RANGE_Y, MAX_RANGE_Y),
        phase: Math.random() * Math.PI * 2,
        normalPhaseSpeed,
        currentPhaseSpeed: normalPhaseSpeed,
        targetPhaseSpeed: normalPhaseSpeed,
        rippleEffect: 0,
        rippleAngle: 0,
        isRippling: false,
        resetBasePosition: false,
        transitioning: false,
        transitionProgress: 0,
        rippleEndX: null,
        rippleEndY: null,
        targetBaseX: null,
        targetBaseY: null,
        returnSpeed: null,
        isDrifting: false,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        originalVx: 0,
        originalVy: 0,
    };
};

export const createDriftingCharacter = (x, y) => {
    const char = createHoveringCharacter(x, y);
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(DRIFTING_SPEED_MIN, DRIFTING_SPEED_MAX);
    const velocity = vectorFromAngle(angle, speed);

    char.isDrifting = true;
    char.vx = velocity.x;
    char.vy = velocity.y;
    char.originalVx = velocity.x;
    char.originalVy = velocity.y;
    return char;
};

export const targetCharacterCount = (width, height) =>
    Math.floor((width / CHARACTER_SPACING) * (height / CHARACTER_SPACING) * DENSITY_FACTOR);

export const spawnCharacter = (width, height) => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return Math.random() * 100 < DRIFTING_PERCENTAGE
        ? createDriftingCharacter(x, y)
        : createHoveringCharacter(x, y);
};

const createCharacters = (width, height) => {
    const count = targetCharacterCount(width, height);
    const driftingCount = Math.floor(count * (DRIFTING_PERCENTAGE / 100));
    const characters = [];

    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        characters.push(i < driftingCount
            ? createDriftingCharacter(x, y)
            : createHoveringCharacter(x, y));
    }
    return characters;
};

export const createState = (width, height) => ({
    width,
    height,
    characters: createCharacters(width, height),
    mouse: { x: null, y: null },
});
