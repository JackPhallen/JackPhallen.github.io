// Tuning constants for the floating-characters animation.

export const MOVEMENT_SPEED = 0.14;
export const MOVEMENT_RANGE = 15;
export const AMPLITUDE_FACTOR = 0.8;
export const SINE_FREQUENCY_RATIO = 0.7;

export const MIN_MOVEMENT_SPEED = MOVEMENT_SPEED * 0.25;
export const MAX_MOVEMENT_SPEED = MOVEMENT_SPEED * 1.5;

export const MIN_RANGE_X = MOVEMENT_RANGE * 0.66;
export const MAX_RANGE_X = MOVEMENT_RANGE * 1.33;
export const MIN_RANGE_Y = MOVEMENT_RANGE * 0.66;
export const MAX_RANGE_Y = MOVEMENT_RANGE * 1.33;

export const TRANSITION_SPEED = 0.03;
export const BOUNCE_DAMPENING = 0.8;
export const SPEED_TRANSITION_RATE = 0.03;
export const PHASE_SMOOTHING = 0.3;

export const ENABLE_CURSOR_SPEED = true;
export const CURSOR_SPEED_MULTIPLIER = 3;
export const CURSOR_SPEED_TRIGGER_RADIUS = 20;

export const ENABLE_CLICK_RIPPLE = true;
export const RIPPLE_FORCE = 5;
export const RIPPLE_RADIUS = 150;
export const RIPPLE_FALLOFF = 0.92;
export const MIN_RIPPLE_EFFECT = 0.1;

export const DRIFTING_PERCENTAGE = 15;
export const MODE_SWITCH_COUNT = 3;

export const DRIFTING_SPEED_MIN = 0.35;
export const DRIFTING_SPEED_MAX = 1.4;

export const ENABLE_BOUNDARY_UPDATE = true;
export const UPDATE_BOUNDARY_COUNT = 5;
export const OFFSCREEN_RETURN_SPEED_MIN = 0.5;
export const OFFSCREEN_RETURN_SPEED_MAX = 1.5;
export const SCREEN_SAFE_ZONE_MIN = 0.3;

export const CHARACTER_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:<>/?";

export const BACKGROUND_COLOR = '#000000';
export const CHARACTER_RGB = '255, 255, 255'; // depth supplies the alpha
export const SHADOW_COLOR = 'rgba(255, 255, 255, 0.15)';
export const SHADOW_OFFSET_X = 3;
export const SHADOW_OFFSET_Y = 3;
export const FONT_FAMILY = 'monospace';

export const MIN_CHAR_SIZE = 14;
export const MAX_CHAR_SIZE = 24;

export const MIN_DEPTH = 0.5;
export const MAX_DEPTH = 1.0;

export const CHARACTER_SPACING = 40;
export const DENSITY_FACTOR = 0.5;

export const RESIZE_DEBOUNCE_TIME = 250;
export const TIMER_INTERVAL = 5000;
