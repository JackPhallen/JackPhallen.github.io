import { useRef } from 'react';
import { useFloatingCharacters } from './useFloatingCharacters';
import './floating-characters.css';

const FloatingCharacters = () => {
    const canvasRef = useRef(null);
    useFloatingCharacters(canvasRef);

    return (
        <div className="floating-characters">
            <canvas ref={canvasRef} className="floating-characters__canvas" aria-hidden="true" />
        </div>
    );
};

export default FloatingCharacters;
