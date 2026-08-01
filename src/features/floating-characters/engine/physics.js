import {
    ENABLE_CLICK_RIPPLE,
    MIN_RIPPLE_EFFECT,
    RIPPLE_FALLOFF,
    RIPPLE_FORCE,
    RIPPLE_RADIUS,
    BOUNCE_DAMPENING,
    TRANSITION_SPEED,
    SPEED_TRANSITION_RATE,
    PHASE_SMOOTHING,
    AMPLITUDE_FACTOR,
    SINE_FREQUENCY_RATIO,
    ENABLE_CURSOR_SPEED,
    CURSOR_SPEED_MULTIPLIER,
    CURSOR_SPEED_TRIGGER_RADIUS,
    MIN_MOVEMENT_SPEED,
    MAX_MOVEMENT_SPEED,
    MIN_RANGE_X,
    MAX_RANGE_X,
    MIN_RANGE_Y,
    MAX_RANGE_Y,
    DRIFTING_SPEED_MIN,
    DRIFTING_SPEED_MAX,
    ENABLE_BOUNDARY_UPDATE,
    UPDATE_BOUNDARY_COUNT,
    MODE_SWITCH_COUNT,
    OFFSCREEN_RETURN_SPEED_MIN,
    OFFSCREEN_RETURN_SPEED_MAX,
    SCREEN_SAFE_ZONE_MIN,
} from '../config';
import { randomBetween, calculateDistance, calculateAngle, vectorFromAngle } from '../utils';

const easePhaseSpeed = (char) => {
    char.currentPhaseSpeed += (char.targetPhaseSpeed - char.currentPhaseSpeed) * SPEED_TRANSITION_RATE;
    if (Math.abs(char.targetPhaseSpeed - char.currentPhaseSpeed) < 0.001 * char.targetPhaseSpeed) {
        char.currentPhaseSpeed = char.targetPhaseSpeed;
    }
};

const isOffScreen = (char, width, height) =>
    char.x < -char.size ||
    char.x > width + char.size ||
    char.y < -char.size ||
    char.y > height + char.size;

// Safe central region used when rescuing off-screen characters
const calculateSafeBounds = (width, height) => {
    const minSafeZone = Math.min(width, height) * SCREEN_SAFE_ZONE_MIN;
    return {
        left: minSafeZone,
        right: width - minSafeZone,
        top: minSafeZone,
        bottom: height - minSafeZone,
    };
};

export const convertToHovering = (char) => {
    if (!char.isDrifting) return;

    char.baseX = char.x;
    char.baseY = char.y;
    char.rangeX = randomBetween(MIN_RANGE_X, MAX_RANGE_X);
    char.rangeY = randomBetween(MIN_RANGE_Y, MAX_RANGE_Y);
    char.phase = Math.random() * Math.PI * 2;
    char.normalPhaseSpeed = randomBetween(MIN_MOVEMENT_SPEED, MAX_MOVEMENT_SPEED);
    char.currentPhaseSpeed = char.normalPhaseSpeed;
    char.targetPhaseSpeed = char.normalPhaseSpeed;
    char.isDrifting = false;

    char.isRippling = false;
    char.rippleEffect = 0;
};

export const convertToDrifting = (char) => {
    if (char.isDrifting) return;

    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(DRIFTING_SPEED_MIN, DRIFTING_SPEED_MAX);
    const velocity = vectorFromAngle(angle, speed);

    char.vx = velocity.x;
    char.vy = velocity.y;
    char.originalVx = velocity.x;
    char.originalVy = velocity.y;
    char.isDrifting = true;
    char.isRippling = false;

    char.transitioning = false;
    char.transitionProgress = 0;
};

const updateDrifting = (char, state) => {
    if (ENABLE_CLICK_RIPPLE && char.rippleEffect > MIN_RIPPLE_EFFECT) {
        char.isRippling = true;
        char.x += Math.cos(char.rippleAngle) * char.rippleEffect;
        char.y += Math.sin(char.rippleAngle) * char.rippleEffect;
        char.rippleEffect *= RIPPLE_FALLOFF;

        if (char.rippleEffect <= MIN_RIPPLE_EFFECT) {
            char.isRippling = false;
            const currentSpeed = Math.sqrt(char.vx * char.vx + char.vy * char.vy);
            const originalDirection = Math.atan2(char.originalVy, char.originalVx);
            const newVelocity = vectorFromAngle(originalDirection, currentSpeed);
            char.vx = newVelocity.x;
            char.vy = newVelocity.y;
        }
        return;
    }

    if (char.isRippling) return;

    char.x += char.vx;
    char.y += char.vy;

    const padding = char.size / 2;
    if (char.x < padding || char.x > state.width - padding) {
        char.vx = -char.vx * BOUNCE_DAMPENING;
        if (char.x < padding) char.x = padding;
        if (char.x > state.width - padding) char.x = state.width - padding;
        char.originalVx = char.vx;
    }
    if (char.y < padding || char.y > state.height - padding) {
        char.vy = -char.vy * BOUNCE_DAMPENING;
        if (char.y < padding) char.y = padding;
        if (char.y > state.height - padding) char.y = state.height - padding;
        char.originalVy = char.vy;
    }
};

const updateHovering = (char, state) => {
    if (ENABLE_CLICK_RIPPLE && char.rippleEffect > MIN_RIPPLE_EFFECT) {
        char.x += Math.cos(char.rippleAngle) * char.rippleEffect;
        char.y += Math.sin(char.rippleAngle) * char.rippleEffect;
        char.rippleEffect *= RIPPLE_FALLOFF;

        if (char.rippleEffect <= MIN_RIPPLE_EFFECT && char.resetBasePosition) {
            char.transitioning = true;
            char.transitionProgress = 0;
            char.resetBasePosition = false;
            char.rippleEndX = char.x;
            char.rippleEndY = char.y;
            char.baseX = char.x;
            char.baseY = char.y;
            char.rangeX = randomBetween(MIN_RANGE_X, MAX_RANGE_X);
            char.rangeY = randomBetween(MIN_RANGE_Y, MAX_RANGE_Y);
            char.normalPhaseSpeed = randomBetween(MIN_MOVEMENT_SPEED, MAX_MOVEMENT_SPEED);
            char.currentPhaseSpeed = char.normalPhaseSpeed * 0.1;
            char.targetPhaseSpeed = char.normalPhaseSpeed;
        }
    } else if (char.transitioning) {
        char.transitionProgress += TRANSITION_SPEED;
        easePhaseSpeed(char);
        if (char.transitionProgress >= 1) {
            char.transitioning = false;
        } else {
            char.phase += char.currentPhaseSpeed * PHASE_SMOOTHING;
            const targetX = char.baseX + Math.sin(char.phase) * char.rangeX * AMPLITUDE_FACTOR;
            const targetY = char.baseY + Math.cos(char.phase * SINE_FREQUENCY_RATIO) * char.rangeY * AMPLITUDE_FACTOR;
            const t = 1 - Math.pow(1 - char.transitionProgress, 3);
            char.x = char.rippleEndX + (targetX - char.rippleEndX) * t;
            char.y = char.rippleEndY + (targetY - char.rippleEndY) * t;
        }
    } else {
        char.targetPhaseSpeed =
            ENABLE_CURSOR_SPEED &&
            state.mouse.x !== null &&
            calculateDistance(char.x, char.y, state.mouse.x, state.mouse.y) < CURSOR_SPEED_TRIGGER_RADIUS
                ? char.normalPhaseSpeed * CURSOR_SPEED_MULTIPLIER
                : char.normalPhaseSpeed;
        easePhaseSpeed(char);

        char.phase += char.currentPhaseSpeed * PHASE_SMOOTHING;
        char.x = char.baseX + Math.sin(char.phase) * char.rangeX * AMPLITUDE_FACTOR;
        char.y = char.baseY + Math.cos(char.phase * SINE_FREQUENCY_RATIO) * char.rangeY * AMPLITUDE_FACTOR;
    }

    if (isOffScreen(char, state.width, state.height)) {
        if (char.targetBaseX === null) {
            const bounds = calculateSafeBounds(state.width, state.height);
            char.targetBaseX = randomBetween(bounds.left, bounds.right);
            char.targetBaseY = randomBetween(bounds.top, bounds.bottom);
            char.returnSpeed = randomBetween(OFFSCREEN_RETURN_SPEED_MIN, OFFSCREEN_RETURN_SPEED_MAX);
        }

        const dist = calculateDistance(char.baseX, char.baseY, char.targetBaseX, char.targetBaseY);
        if (dist > 0.1) {
            const dirX = (char.targetBaseX - char.baseX) / dist;
            const dirY = (char.targetBaseY - char.baseY) / dist;
            char.baseX += dirX * char.returnSpeed;
            char.baseY += dirY * char.returnSpeed;
            char.x += dirX * char.returnSpeed * 0.5;
            char.y += dirY * char.returnSpeed * 0.5;
        } else {
            char.targetBaseX = null;
            char.targetBaseY = null;
            char.returnSpeed = null;
        }
    }
};

// Advance one character by one frame
export const updateCharacter = (char, state) => {
    if (char.isDrifting) {
        updateDrifting(char, state);
    } else {
        updateHovering(char, state);
    }
};

export const applyClickRipple = (state, clickX, clickY) => {
    if (!ENABLE_CLICK_RIPPLE) return;

    for (const char of state.characters) {
        const distance = calculateDistance(char.x, char.y, clickX, clickY);
        if (distance < RIPPLE_RADIUS) {
            const forceFactor = 1 - distance / RIPPLE_RADIUS;
            char.rippleEffect = RIPPLE_FORCE * forceFactor;
            char.rippleAngle = calculateAngle(char.x, char.y, clickX, clickY);

            if (char.isDrifting) {
                // avoid freezing on a sub-threshold rippleEffect that never runs the ripple branch
                char.isRippling = char.rippleEffect > MIN_RIPPLE_EFFECT;
            } else {
                char.resetBasePosition = true;
                char.currentPhaseSpeed = char.normalPhaseSpeed;
                char.targetPhaseSpeed = char.normalPhaseSpeed;
            }
        }
    }
};

export const rerollHoverRanges = (state) => {
    if (!ENABLE_BOUNDARY_UPDATE) return;
    const { characters } = state;
    if (characters.length === 0) return;

    for (let i = 0; i < UPDATE_BOUNDARY_COUNT; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        if (!char.isDrifting && !(char.rippleEffect > MIN_RIPPLE_EFFECT || char.transitioning)) {
            char.rangeX = randomBetween(MIN_RANGE_X, MAX_RANGE_X);
            char.rangeY = randomBetween(MIN_RANGE_Y, MAX_RANGE_Y);
        }
    }
};

// Flip a few characters between drifting and hovering
export const switchRandomModes = (state) => {
    const { characters } = state;
    if (characters.length === 0) return;

    for (let i = 0; i < MODE_SWITCH_COUNT; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        if (char.rippleEffect > MIN_RIPPLE_EFFECT || char.transitioning) continue;
        if (char.isDrifting) {
            convertToHovering(char);
        } else {
            convertToDrifting(char);
        }
    }
};
