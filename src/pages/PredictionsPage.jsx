import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import TerminalShell, { TerminalCommandLine } from '../components/TerminalShell';
import { useTypedCommand } from '../components/useTypedCommand';
import Predictions from '../features/predictions/Predictions';
import { parseLink } from '../features/predictions/link';

const CREATE_COMMAND = './fun/predictions --commit';
const VIEW_COMMAND = './fun/predictions --verify';

const PredictionsContent = ({ commitment }) => {
    const { typedCommand, commandDone } = useTypedCommand(commitment ? VIEW_COMMAND : CREATE_COMMAND);

    return (
        <>
            <TerminalCommandLine command={typedCommand} done={commandDone} />
            {commandDone && <Predictions commitment={commitment} />}
        </>
    );
};

const PredictionsPage = () => {
    const { search } = useLocation();
    const commitment = useMemo(() => parseLink(search), [search]);

    return (
        <TerminalShell
            title="Predictions"
            hints={[{ key: '▲/▼', action: 'scroll' }]}
            scrollKeys
        >
            <PredictionsContent key={search || 'create'} commitment={commitment} />
        </TerminalShell>
    );
};

export default PredictionsPage;
