import React, { useEffect, useRef } from 'react';

const FloatingCharacters = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    // References to manually cleanup rather than relying on React
    const animFrameIdRef = useRef(null);
    const charactersRef = useRef([]);
    const eventQueueRef = useRef(null);
    const activeEventListenersRef = useRef([]);

    // Manually handle canvas dimensions
    useEffect(() => {
        const fixHeight = () => {
            const vh = window.innerHeight;
            if (containerRef.current) {
                containerRef.current.style.height = `${vh}px`;
            }
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = vh;
            }
        };
        // Fix height on mount
        fixHeight();

        // Track event listeners for proper cleanup
        const addTrackedEventListener = (element, eventType, handler) => {
            element.addEventListener(eventType, handler);
            activeEventListenersRef.current.push({ element, eventType, handler });
        };
        addTrackedEventListener(window, 'resize', fixHeight);
        addTrackedEventListener(window, 'orientationchange', fixHeight);

        // ================================================================
        // CORE MOVEMENT CONSTANTS
        // ================================================================
        // Primary movement controls - these affect multiple systems
        const MOVEMENT_SPEED = 0.14;      // Base floating speed multiplier for all character movement
        const MOVEMENT_RANGE = 15;       // Base range distance for floating movement patterns
        const AMPLITUDE_FACTOR = 0.8;    // Movement amplitude factor - higher values = wider oscillations
        const SINE_FREQUENCY_RATIO = 0.7; // Ratio between horizontal and vertical oscillation frequencies

        // Derived movement speeds - based on core MOVEMENT_SPEED
        const MIN_MOVEMENT_SPEED = MOVEMENT_SPEED * 0.25;
        const MAX_MOVEMENT_SPEED = MOVEMENT_SPEED * 1.5;

        // Derived movement ranges - based on core MOVEMENT_RANGE
        const MIN_RANGE_X = MOVEMENT_RANGE * 0.66;  // Minimum horizontal movement range
        const MAX_RANGE_X = MOVEMENT_RANGE * 1.33;  // Maximum horizontal movement range
        const MIN_RANGE_Y = MOVEMENT_RANGE * 0.66;  // Minimum vertical movement range
        const MAX_RANGE_Y = MOVEMENT_RANGE * 1.33;  // Maximum vertical movement range

        // ================================================================
        // PHYSICS & TRANSITIONS
        // ================================================================
        // Transition and physics controls
        const TRANSITION_SPEED = 0.03;   // How fast characters transition back to normal movement
        const BOUNCE_DAMPENING = 0.8;    // Reduces velocity when characters bounce off walls (0-1)
        const SPEED_TRANSITION_RATE = 0.03; // How quickly character speeds change
        const PHASE_SMOOTHING = 0.3;     // Controls smoothness of oscillation

        // ================================================================
        // INTERACTION EFFECTS
        // ================================================================
        // Cursor interaction
        const ENABLE_CURSOR_SPEED = true;           // Enable/disable cursor hover speed boost
        const CURSOR_SPEED_MULTIPLIER = 3;          // Multiplies character speed when cursor is near
        const CURSOR_SPEED_TRIGGER_RADIUS = 20;     // Hover radius for speed boost effect

        // Click ripple effect
        const ENABLE_CLICK_RIPPLE = true;           // Enable/disable the click ripple effect
        const RIPPLE_FORCE = 5;                     // Overall force multiplier for the click ripple effect
        const RIPPLE_RADIUS = 150;                  // Maximum distance from click that affects characters
        const RIPPLE_FALLOFF = 0.92;                // How quickly the ripple effect diminishes (0-1)
        const MIN_RIPPLE_EFFECT = 0.1;              // Threshold below which ripple effect is ignored

        // ================================================================
        // CHARACTER BEHAVIOR
        // ================================================================
        // Character mode distribution
        const DRIFTING_PERCENTAGE = 15;             // Percentage of characters that will drift (0-100)
        const MODE_SWITCH_COUNT = 3;                // Number of characters to switch modes each interval

        // Drifting character physics
        const DRIFTING_SPEED_MIN = 0.35;
        const DRIFTING_SPEED_MAX = 1.4;

        // Off-screen handling
        const ENABLE_BOUNDARY_UPDATE = true;        // Enable/disable periodic boundary updates
        const UPDATE_BOUNDARY_COUNT = 5;            // Number of characters to update position each interval
        const OFFSCREEN_RETURN_SPEED_MIN = 0.5;     // Minimum speed for returning to screen
        const OFFSCREEN_RETURN_SPEED_MAX = 1.5;     // Maximum speed for returning to screen
        const SCREEN_SAFE_ZONE_MIN = 0.3;           // Minimum safe zone (% of screen width/height)
        const SCREEN_SAFE_ZONE_MAX = 0.7;           // Maximum safe zone (% of screen width/height)

        // ================================================================
        // CHARACTER APPEARANCE
        // ================================================================
        // Character content - the set of symbols that will be displayed
        const CHARACTER_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:<>/?";

        // Visual styling
        const BACKGROUND_COLOR = '#000000';
        const CHARACTER_COLOR = '#FFFFFF';
        const SHADOW_COLOR = 'rgba(255, 255, 255, 0.15)';  // Character shadow color
        const SHADOW_OFFSET_X = 3;                     // X offset for character shadows
        const SHADOW_OFFSET_Y = 3;                     // Y offset for character shadows
        const FONT_FAMILY = 'monospace';

        // Character size range
        const MIN_CHAR_SIZE = 14;
        const MAX_CHAR_SIZE = 24;

        // Character depth effect - controls transparency and visual layering
        const MIN_DEPTH = 0.5;                         // Minimum opacity for characters (0-1)
        const MAX_DEPTH = 1.0;                         // Maximum opacity for characters (0-1)

        // ================================================================
        // LAYOUT & DENSITY
        // ================================================================
        // Canvas and layout constants
        const CHARACTER_SPACING = 40;                     // Average space between characters (pixel density)
        const DENSITY_FACTOR = 0.5;                       // Overall density of characters on screen (0-1)

        // Performance optimization
        const RESIZE_DEBOUNCE_TIME = 250;                 // Milliseconds to wait before handling window resize
        const TIMER_INTERVAL = 5000; // 5 seconds interval for event queue

        // ================================================================
        // UTILITY FUNCTIONS
        // ================================================================
        // Generate a random number between min and max (inclusive)
        const randomBetween = (min, max) => min + Math.random() * (max - min);

        // Calculate distance between two points
        const calculateDistance = (x1, y1, x2, y2) => {
            const dx = x1 - x2;
            const dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        };

        // Calculate angle between two points (in radians)
        const calculateAngle = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2);

        // Create a vector from angle and magnitude
        const vectorFromAngle = (angle, magnitude) => ({
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude
        });

        // Check if a character is off-screen
        const isCharacterOffScreen = (char, canvas) => {
            return (char.x < -char.size ||
                char.x > canvas.width + char.size ||
                char.y < -char.size ||
                char.y > canvas.height + char.size);
        };

        // Calculate safe bounds for character placement
        const calculateSafeBounds = (canvas) => {
            const minSafeZone = Math.min(canvas.width, canvas.height) * SCREEN_SAFE_ZONE_MIN;
            return {
                left: minSafeZone,
                right: canvas.width - minSafeZone,
                top: minSafeZone,
                bottom: canvas.height - minSafeZone
            };
        };

        // Apply velocity transition for character speed changes
        const applyVelocityTransition = (char) => {
            char.currentPhaseSpeed += (char.normalPhaseSpeed - char.currentPhaseSpeed) * SPEED_TRANSITION_RATE;
            if (Math.abs(char.normalPhaseSpeed - char.currentPhaseSpeed) < 0.001 * char.normalPhaseSpeed) {
                char.currentPhaseSpeed = char.normalPhaseSpeed;
                char.velocityTransitioning = false;
            }
            return char;
        };

        // Draw a character with shadow and depth effects
        const drawCharacter = (ctx, char) => {
            // Draw shadow
            ctx.fillStyle = SHADOW_COLOR;
            ctx.font = `${char.size}px ${FONT_FAMILY}`;
            ctx.fillText(char.char, char.x + SHADOW_OFFSET_X, char.y + SHADOW_OFFSET_Y);

            // Draw depth-based opacity
            ctx.fillStyle = CHARACTER_COLOR.replace(')', `, ${char.depth})`).replace('rgb', 'rgba');
            ctx.font = `${char.size}px ${FONT_FAMILY}`;
            ctx.fillText(char.char, char.x, char.y);
        };

        // ================================================================
        // Actual logic begins here
        // ================================================================

        // == Setup canvas and context ==
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Global variables for cursor position
        let mouseX = null;
        let mouseY = null;
        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        addTrackedEventListener(canvas, 'mousemove', handleMouseMove);

        // == Create characters ==
        // Get counts
        const characters = [];
        charactersRef.current = characters;

        const characterCount = Math.floor(
            (canvas.width / CHARACTER_SPACING) *
            (canvas.height / CHARACTER_SPACING) *
            DENSITY_FACTOR
        );
        const driftingCount = Math.floor(characterCount * (DRIFTING_PERCENTAGE / 100));

        // Function to create base character object (hovering)
        const createBaseCharacter = (x, y) => {
            const char = CHARACTER_SET[Math.floor(Math.random() * CHARACTER_SET.length)];
            const size = randomBetween(MIN_CHAR_SIZE, MAX_CHAR_SIZE);
            const depth = randomBetween(MIN_DEPTH, MAX_DEPTH);
            const normalPhaseSpeed = randomBetween(MIN_MOVEMENT_SPEED, MAX_MOVEMENT_SPEED);

            return {
                x,
                y,
                char,
                size,
                depth,
                baseX: x,
                baseY: y,
                rangeX: randomBetween(MIN_RANGE_X, MAX_RANGE_X),
                rangeY: randomBetween(MIN_RANGE_Y, MAX_RANGE_Y),
                phase: Math.random() * Math.PI * 2,
                phaseSpeed: normalPhaseSpeed,
                normalPhaseSpeed,
                currentPhaseSpeed: normalPhaseSpeed,
                rippleEffect: 0,
                rippleAngle: 0,
                resetBasePosition: false,
                transitioning: false,
                transitionProgress: 0,
                velocityTransitioning: false,
                cursorSpeedTriggered: false,
                isDrifting: false,
                // Initialize velocity values for all characters
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
            };
        };

        // Function to create drifting character object
        const createDriftingCharacter = (x, y) => {
            const baseChar = createBaseCharacter(x, y);
            const angle = Math.random() * Math.PI * 2;
            const speed = randomBetween(DRIFTING_SPEED_MIN, DRIFTING_SPEED_MAX);
            const velocity = vectorFromAngle(angle, speed);

            return {
                ...baseChar,
                isDrifting: true,
                vx: velocity.x,
                vy: velocity.y,
                originalVx: velocity.x,
                originalVy: velocity.y,
                isRippling: false
            };
        };

        // Create character objects
        for (let i = 0; i < characterCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            // First N characters will drift
            const isDrifting = i < driftingCount;
            let charObj;
            if (isDrifting) {
                charObj = createDriftingCharacter(x, y);
            } else {
                charObj = createBaseCharacter(x, y);
            }
            characters.push(charObj);
        }

        // Queue for reoccurring tasks: Randomly set isDrifting = !isDrifting and also change hover boundaries
        class EventQueue {
            constructor(interval = TIMER_INTERVAL) {
                this.events = [];
                this.running = false;
                this.timerId = null;
                this.interval = interval;
            }

            addEvent(name, callback) {
                this.events.push({
                    name,
                    callback
                });
                if (!this.running) {
                    this.start();
                }
                return this;
            }

            removeEvent(name) {
                this.events = this.events.filter(event => event.name !== name);
                if (this.events.length === 0) {
                    this.stop();
                }
                return this;
            }

            start() {
                if (this.running) return;
                this.running = true;

                const runEvents = () => {
                    // Execute all events
                    this.events.forEach(event => {
                        event.callback();
                    });

                    // Schedule the next run only if we're still running
                    if (this.running) {
                        this.timerId = setTimeout(runEvents, this.interval);
                    }
                };
                this.timerId = setTimeout(runEvents, this.interval);
            }

            stop() {
                if (!this.running) return;
                clearTimeout(this.timerId);
                this.timerId = null;
                this.running = false;
            }
        }

        // Create event queue instance for reoccuring tasks: Randomly set isDrifting = !isDrifting and also change hover boundaries
        const eventQueue = new EventQueue(TIMER_INTERVAL);
        eventQueueRef.current = eventQueue;

        // Function to convert from drifting to hovering mode
        const convertToHovering = (character) => {
            if (!character.isDrifting) return;

            // Store the current position as the base
            character.baseX = character.x;
            character.baseY = character.y;

            // Set up hovering properties
            character.rangeX = randomBetween(MIN_RANGE_X, MAX_RANGE_X);
            character.rangeY = randomBetween(MIN_RANGE_Y, MAX_RANGE_Y);
            character.phase = Math.random() * Math.PI * 2;
            character.normalPhaseSpeed = randomBetween(MIN_MOVEMENT_SPEED, MAX_MOVEMENT_SPEED);
            character.currentPhaseSpeed = character.normalPhaseSpeed;
            character.isDrifting = false;

            // Reset any ripple effects
            character.isRippling = false;
            character.rippleEffect = 0;
        };

        // Function to convert from hovering to drifting mode
        const convertToDrifting = (character) => {
            if (character.isDrifting) return;

            // Random angle in radians
            const angle = Math.random() * Math.PI * 2;
            // Random speed within the drifting range
            const speed = randomBetween(DRIFTING_SPEED_MIN, DRIFTING_SPEED_MAX);
            const velocity = vectorFromAngle(angle, speed);

            // Set up drifting properties
            character.vx = velocity.x;
            character.vy = velocity.y;
            character.originalVx = velocity.x;
            character.originalVy = velocity.y;
            character.isDrifting = true;
            character.isRippling = false;

            // Clean up hovering-specific properties
            character.transitioning = false;
            character.transitionProgress = 0;
            character.velocityTransitioning = false;
        };

        // Add boundary update event
        eventQueue.addEvent('boundaryUpdate', () => {
            if (!ENABLE_BOUNDARY_UPDATE) return;

            for (let i = 0; i < UPDATE_BOUNDARY_COUNT; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                const char = characters[randomIndex];
                // Only update: non-drifting, not affected by ripple, not transitioning
                if (!char.isDrifting && !(char.rippleEffect > MIN_RIPPLE_EFFECT || char.transitioning)) {
                    char.rangeX = randomBetween(MIN_RANGE_X, MAX_RANGE_X);
                    char.rangeY = randomBetween(MIN_RANGE_Y, MAX_RANGE_Y);
                }
            }
        });

        // Add mode switching event
        eventQueue.addEvent('modeSwitch', () => {
            // Randomly select characters to switch modes
            for (let i = 0; i < MODE_SWITCH_COUNT; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                const char = characters[randomIndex];
                // Skip if rippling or transitioning
                if (char.rippleEffect > MIN_RIPPLE_EFFECT || char.transitioning) continue;
                // Switch the mode
                if (char.isDrifting) {
                    convertToHovering(char);
                } else {
                    convertToDrifting(char);
                }
            }
        });

        // Animation loop with tracked frame IDs
        const animFrameIds = [];
        const animate = () => {
            ctx.fillStyle = BACKGROUND_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            characters.forEach(char => {
                if (char.isDrifting) {
                    // Handle click ripple effect if enabled and active
                    if (ENABLE_CLICK_RIPPLE && char.rippleEffect > MIN_RIPPLE_EFFECT) {
                        char.isRippling = true;
                        char.x += Math.cos(char.rippleAngle) * char.rippleEffect;
                        char.y += Math.sin(char.rippleAngle) * char.rippleEffect;
                        char.rippleEffect *= RIPPLE_FALLOFF;

                        if (char.rippleEffect <= MIN_RIPPLE_EFFECT) {
                            char.isRippling = false;
                            // Restore original velocity direction but potentially with new magnitude
                            const currentSpeed = Math.sqrt(char.vx * char.vx + char.vy * char.vy);
                            const originalDirection = Math.atan2(char.originalVy, char.originalVx);
                            const newVelocity = vectorFromAngle(originalDirection, currentSpeed);
                            char.vx = newVelocity.x;
                            char.vy = newVelocity.y;
                        }
                    } else if (!char.isRippling) {
                        // Linear movement for drifting characters
                        char.x += char.vx;
                        char.y += char.vy;

                        // Boundary collision detection and bouncing
                        const padding = char.size / 2; // Prevent characters from going partially off-screen
                        if (char.x < padding || char.x > canvas.width - padding) {
                            char.vx = -char.vx * BOUNCE_DAMPENING;
                            // Make sure character stays in bounds
                            if (char.x < padding) char.x = padding;
                            if (char.x > canvas.width - padding) char.x = canvas.width - padding;
                            // Update original velocity direction
                            char.originalVx = char.vx;
                        }

                        if (char.y < padding || char.y > canvas.height - padding) {
                            char.vy = -char.vy * BOUNCE_DAMPENING;
                            // Make sure character stays in bounds
                            if (char.y < padding) char.y = padding;
                            if (char.y > canvas.height - padding) char.y = canvas.height - padding;
                            // Update original velocity direction
                            char.originalVy = char.vy;
                        }
                    }
                } else { // Handle hovering characters
                    // Handle click ripple effect if enabled
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
                            char.currentPhaseSpeed = char.phaseSpeed * 0.1;
                            char.velocityTransitioning = true;
                        }
                    } else if (char.transitioning) {
                        char.transitionProgress += TRANSITION_SPEED;
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
                        if (char.velocityTransitioning) {
                            applyVelocityTransition(char);
                        }
                    } else {
                        // Enable hover speed boost if configured
                        if (ENABLE_CURSOR_SPEED && mouseX !== null && mouseY !== null) {
                            const distanceSpeed = calculateDistance(char.x, char.y, mouseX, mouseY);
                            if (distanceSpeed < CURSOR_SPEED_TRIGGER_RADIUS && !char.cursorSpeedTriggered) {
                                char.currentPhaseSpeed = char.normalPhaseSpeed * CURSOR_SPEED_MULTIPLIER;
                                char.velocityTransitioning = true;
                                char.cursorSpeedTriggered = true;
                            } else if (distanceSpeed >= CURSOR_SPEED_TRIGGER_RADIUS) {
                                char.cursorSpeedTriggered = false;
                            }
                        }

                        if (char.velocityTransitioning) {
                            applyVelocityTransition(char);
                        }

                        char.phase += char.currentPhaseSpeed * PHASE_SMOOTHING;
                        char.x = char.baseX + Math.sin(char.phase) * char.rangeX * AMPLITUDE_FACTOR;
                        char.y = char.baseY + Math.cos(char.phase * SINE_FREQUENCY_RATIO) * char.rangeY * AMPLITUDE_FACTOR;
                    }

                    // Check if character is completely off-screen
                    if (isCharacterOffScreen(char, canvas)) {
                        // Force character to have a target if it's off-screen
                        if (!char.hasOwnProperty('targetBaseX')) {
                            // Calculate safe bounds for return
                            const bounds = calculateSafeBounds(canvas);

                            // Add randomness within the allowed range
                            // This ensures characters return to varied positions, not just the edges
                            char.targetBaseX = randomBetween(bounds.left, bounds.right);
                            char.targetBaseY = randomBetween(bounds.top, bounds.bottom);

                            // Set a random return speed based on the configured range
                            char.returnSpeed = randomBetween(OFFSCREEN_RETURN_SPEED_MIN, OFFSCREEN_RETURN_SPEED_MAX);
                        }

                        // Calculate direction to target
                        const dist = calculateDistance(char.baseX, char.baseY, char.targetBaseX, char.targetBaseY);

                        if (dist > 0.1) {
                            // Calculate normalized direction vector
                            const dirX = (char.targetBaseX - char.baseX) / dist;
                            const dirY = (char.targetBaseY - char.baseY) / dist;

                            char.baseX += dirX * char.returnSpeed;
                            char.baseY += dirY * char.returnSpeed;

                            // Also apply an immediate pull on the character's position
                            char.x += dirX * char.returnSpeed * 0.5;
                            char.y += dirY * char.returnSpeed * 0.5;
                        } else {
                            // We've reached the target
                            delete char.targetBaseX;
                            delete char.targetBaseY;
                            delete char.returnSpeed;
                        }
                    }
                }

                // Draw the character
                drawCharacter(ctx, char);
            });

            // Store the animation frame ID for proper cancellation
            const frameId = requestAnimationFrame(animate);
            animFrameIds.push(frameId);
            animFrameIdRef.current = frameId;
        };

        // Start the animation
        const initialFrameId = requestAnimationFrame(animate);
        animFrameIds.push(initialFrameId);
        animFrameIdRef.current = initialFrameId;

        // Click event listener to create ripple effect, if enabled
        const handleClick = (e) => {
            if (!ENABLE_CLICK_RIPPLE) return;
            const clickX = e.clientX;
            const clickY = e.clientY;

            characters.forEach(char => {
                const distance = calculateDistance(char.x, char.y, clickX, clickY);

                if (distance < RIPPLE_RADIUS) {
                    const forceFactor = 1 - (distance / RIPPLE_RADIUS);
                    char.rippleEffect = RIPPLE_FORCE * forceFactor;
                    char.rippleAngle = calculateAngle(char.x, char.y, clickX, clickY);

                    if (char.isDrifting) {
                        // For drifting characters, remember that they're affected by ripple
                        char.isRippling = true;
                    } else {
                        // For floating characters, use existing behavior
                        char.resetBasePosition = true;
                        char.currentPhaseSpeed = char.normalPhaseSpeed;
                    }
                }
            });
        };

        addTrackedEventListener(canvas, 'click', handleClick);

        // Handle window resize with debounce
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (canvasRef.current) {
                    canvasRef.current.width = window.innerWidth;
                    canvasRef.current.height = window.innerHeight;
                }
            }, RESIZE_DEBOUNCE_TIME);
        };

        addTrackedEventListener(window, 'resize', handleResize);

        // Enhanced cleanup function
        return () => {
            console.log('FloatingCharacters component unmounting...');

            // Clear the resize debounce timer
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }

            // Stop all animation frames
            if (animFrameIds.length > 0) {
                console.log(`Cancelling ${animFrameIds.length} animation frames`);
                animFrameIds.forEach(id => cancelAnimationFrame(id));
            }

            // Cancel any current animation frame
            if (animFrameIdRef.current) {
                cancelAnimationFrame(animFrameIdRef.current);
                animFrameIdRef.current = null;
            }

            // Stop the event queue
            if (eventQueueRef.current) {
                eventQueueRef.current.stop();
                eventQueueRef.current = null;
            }

            // Remove all tracked event listeners
            if (activeEventListenersRef.current.length > 0) {
                console.log(`Removing ${activeEventListenersRef.current.length} event listeners`);
                activeEventListenersRef.current.forEach(({ element, eventType, handler }) => {
                    element.removeEventListener(eventType, handler);
                });
                activeEventListenersRef.current = [];
            }

            // Clear the canvas before unmounting
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }

            // Clear character array
            if (charactersRef.current) {
                charactersRef.current.length = 0;
            }

            console.log('FloatingCharacters component cleanup complete');
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full overflow-hidden bg-black fill-available-container"
        >
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default FloatingCharacters;