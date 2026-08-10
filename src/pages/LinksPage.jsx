import React from 'react';
import TerminalPage from '../components/TerminalPage';
import { LINKS_CONTENT } from '../content/links';

const LinksPage = () => {
    return (
        <TerminalPage
            title="Links"
            commandText="cat assets/Links.txt"
            content={LINKS_CONTENT}
        />
    );
};

export default LinksPage;
