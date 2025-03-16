import React from 'react';
import TerminalPage from '../components/TerminalPage';

const ContactPage = () => {
    const contactContent = [
        { text: "CONTACT", style: "bold" },
        { text: "=======", style: "bold" },
        { text: "", style: "default" },
        { text: "Feel free to reach out through any of the following channels:", style: "default" },
        { text: "", style: "default" },
        { text: "EMAIL:", style: "bold" },
        { text: "  example@example.com", style: "default" },
        { text: "", style: "default" },
        { text: "SOCIAL MEDIA:", style: "bold" },
        { text: "  • GitHub: github.com/jackphallen", style: "default" },
        { text: "  • LinkedIn: linkedin.com/in/jackphallen", style: "default" },
        { text: "  • Twitter: twitter.com/jackphallen", style: "default" },
        { text: "", style: "default" },
        { text: "FORM:", style: "bold" },
        { text: "  To send a direct message, please fill out the contact form at:", style: "default" },
        { text: "  example.com/contact", style: "default" },
        { text: "", style: "default" },
        { text: "I typically respond within 24-48 hours. Looking forward to connecting!", style: "default" },
    ];

    return (
        <TerminalPage
            title="Contact"
            commandText="cat assets/Contact.txt"
            content={contactContent}
        />
    );
};

export default ContactPage;