import TerminalShell, { TerminalCommandLine } from '../components/TerminalShell';
import { useTypedCommand } from '../components/useTypedCommand';
import Predictions from '../features/predictions/Predictions';

const COMMAND = './fun/predictions --commit';

const PredictionsPage = () => {
    const { typedCommand, commandDone } = useTypedCommand(COMMAND);

    return (
        <TerminalShell
            title="Predictions"
            hints={[{ key: '▲/▼', action: 'scroll' }]}
            scrollKeys
        >
            <TerminalCommandLine command={typedCommand} done={commandDone} />

            {commandDone && <Predictions />}
        </TerminalShell>
    );
};

export default PredictionsPage;
