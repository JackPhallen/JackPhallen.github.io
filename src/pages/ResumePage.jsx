import React from 'react';
import TerminalPage from '../components/TerminalPage';
import { RESUME_CONTENT } from '../content/resume';

const ResumePage = () => {
    return (
        <TerminalPage
            title="Resume"
            commandText="cat assets/Resume.txt"
            content={RESUME_CONTENT}
        />
    );
};

export default ResumePage;
