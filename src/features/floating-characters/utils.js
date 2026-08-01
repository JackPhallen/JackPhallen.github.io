export const randomBetween = (min, max) => min + Math.random() * (max - min);

export const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
};

export const calculateAngle = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2);

export const vectorFromAngle = (angle, magnitude) => ({
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
});

// debounce with an attached cancel() for cleanup
export const debounce = (fn, delay) => {
    let timeoutId = null;
    const debounced = (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
};
