import React from 'react';
import TerminalPage from '../components/TerminalPage';

const AboutPage = () => {
    const aboutContent = [
        { text: "NAME: Jack Phallen", style: "bold" },
        { text: "TITLE: Software Engineer", style: "default" },
        { text: "", style: "default" }, // Empty line
        { text: "ABOUT:", style: "bold" },
        { text: "I'm a software engineer with a passion for creating elegant solutions to complex problems.", style: "default" },
        { text: "My background includes experience in web development, system architecture, and data analysis.", style: "default" },
        { text: "", style: "default" }, // Empty line
        { text: "SKILLS:", style: "bold" },
        { text: "  • JavaScript/React", style: "default" },
        { text: "  • Python", style: "default" },
        { text: "  • Node.js", style: "default" },
        { text: "  • Data Visualization", style: "default" },
        { text: "  • System Architecture", style: "default" },
        { text: "", style: "default" }, // Empty line
        { text: "CONTACT:", style: "bold" },
        { text: "  • Email: example@example.com", style: "default" },
        { text: "  • GitHub: github.com/jackphallen", style: "default" },
        { text: "  • LinkedIn: linkedin.com/in/jackphallen", style: "default" },
    ];

    return (
        <TerminalPage
            title="About"
            commandText="cat assets/About.txt"
            content={aboutContent}
        />
    );
};

export default AboutPage;