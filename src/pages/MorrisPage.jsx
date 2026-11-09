import TerminalShell, { TerminalCommandLine } from '../components/TerminalShell';
import { useTypedCommand } from '../components/useTypedCommand';
import MorrisTraversal from '../features/morris-traversal/MorrisTraversal';
import './MorrisPage.css';

const COMMAND = './fun/morris_traversal --animate';

const MorrisPage = () => {
    const { typedCommand, commandDone } = useTypedCommand(COMMAND);

    return (
        <TerminalShell
            title="Morris"
            hints={[
                { key: '◀/▶', action: 'step' },
                { key: 'SPACE', action: 'play' },
            ]}
        >
            <TerminalCommandLine command={typedCommand} done={commandDone} />

            {commandDone && (
                <div className="morris-page">
                    <div className="morris-page__heading">MORRIS IN-ORDER TRAVERSAL</div>
                    <div className="morris-page__subheading">
                        tree traversal in O(1) extra space — no recursion, no stack, just threads
                    </div>
                    <MorrisTraversal />
                </div>
            )}
        </TerminalShell>
    );
};

export default MorrisPage;
