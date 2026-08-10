import TerminalShell, { TerminalCommandLine } from '../components/TerminalShell';
import { useTypedCommand } from '../components/useTypedCommand';
import MorrisTraversal from '../features/morris-traversal/MorrisTraversal';
import './FunPage.css';

const COMMAND = './fun/morris_traversal --animate';

const FunPage = () => {
    const { typedCommand, commandDone } = useTypedCommand(COMMAND);

    return (
        <TerminalShell
            title="Fun"
            hints={[
                { key: '◀/▶', action: 'step' },
                { key: 'SPACE', action: 'play' },
            ]}
        >
            <TerminalCommandLine command={typedCommand} done={commandDone} />

            {commandDone && (
                <div className="fun-content">
                    <div className="fun-heading">MORRIS IN-ORDER TRAVERSAL</div>
                    <div className="fun-subheading">
                        tree traversal in O(1) extra space — no recursion, no stack, just threads
                    </div>
                    <MorrisTraversal />
                </div>
            )}
        </TerminalShell>
    );
};

export default FunPage;
