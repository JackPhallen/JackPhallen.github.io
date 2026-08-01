import React from 'react';
import TerminalPage from '../components/TerminalPage';
import { ABOUT_CONTENT } from '../content/about';

const AboutPage = () => {
    return (
        <TerminalPage
            title="About"
            commandText="cat assets/About.txt"
            content={ABOUT_CONTENT}
        />
    );
};

export default AboutPage;
