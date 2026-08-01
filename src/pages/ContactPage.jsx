import React from 'react';
import TerminalPage from '../components/TerminalPage';
import { CONTACT_CONTENT } from '../content/contact';

const ContactPage = () => {
    return (
        <TerminalPage
            title="Contact"
            commandText="cat assets/Contact.txt"
            content={CONTACT_CONTENT}
        />
    );
};

export default ContactPage;
