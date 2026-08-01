import { BACKGROUND_COLOR, SHADOW_COLOR, SHADOW_OFFSET_X, SHADOW_OFFSET_Y } from '../config';

export const createRenderer = (ctx) => ({
    clear(width, height) {
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, width, height);
    },

    drawCharacter(char) {
        ctx.font = char.font;

        ctx.fillStyle = SHADOW_COLOR;
        ctx.fillText(char.char, char.x + SHADOW_OFFSET_X, char.y + SHADOW_OFFSET_Y);

        ctx.fillStyle = char.color;
        ctx.fillText(char.char, char.x, char.y);
    },
});
