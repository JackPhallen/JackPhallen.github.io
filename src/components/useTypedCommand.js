import { useEffect, useState } from 'react';

const TYPE_DELAY_MS = 45;

export const useTypedCommand = (command) => {
    const [typedCommand, setTypedCommand] = useState('');
    const [commandDone, setCommandDone] = useState(false);

    // Type out the command
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setTypedCommand(command);
            setCommandDone(true);
            return undefined;
        }
        let index = 0;
        const timer = setInterval(() => {
            index++;
            setTypedCommand(command.slice(0, index));
            if (index >= command.length) {
                clearInterval(timer);
                setCommandDone(true);
            }
        }, TYPE_DELAY_MS);
        return () => clearInterval(timer);
    }, [command]);

    return { typedCommand, commandDone };
};
