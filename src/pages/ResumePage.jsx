import React from 'react';
import TerminalPage from '../components/TerminalPage';

const ResumePage = () => {
    const resumeContent = [
        { text: "RESUME", style: "bold" },
        { text: "======", style: "bold" },
        { text: "", style: "default" },
        { text: "WORK EXPERIENCE:", style: "bold" },
        { text: "  • Senior Software Engineer, Example Tech (2022 - Present)", style: "default" },
        { text: "    - Led development of core platform features", style: "default" },
        { text: "    - Improved system performance by 30%", style: "default" },
        { text: "", style: "default" },
        { text: "  • Software Engineer, Tech Startup (2018 - 2022)", style: "default" },
        { text: "    - Developed frontend applications using React", style: "default" },
        { text: "    - Implemented CI/CD pipelines", style: "default" },
        { text: "", style: "default" },
        { text: "EDUCATION:", style: "bold" },
        { text: "  • BS Computer Science, Example University (2014 - 2018)", style: "default" },
        { text: "", style: "default" },
        { text: "SKILLS:", style: "bold" },
        { text: "  • Languages: JavaScript, Python, Java, C++", style: "default" },
        { text: "  • Frameworks: React, Node.js, Express, Django", style: "default" },
        { text: "  • Tools: Git, Docker, AWS, CI/CD", style: "default" },
    ];

    return (
        <TerminalPage
            commandText="cat assets/Resume.txt"
            content={resumeContent}
        />
    );
};

export default ResumePage;