import React from 'react';
import TerminalPage from '../components/TerminalPage';

const ProjectsPage = () => {
    const projectsContent = [
        { text: "PROJECTS", style: "bold" },
        { text: "========", style: "bold" },
        { text: "", style: "default" },
        { text: "PROJECT 1: Interactive Portfolio", style: "bold" },
        { text: "  • Description: A terminal-style interactive portfolio showcasing my work and skills.", style: "default" },
        { text: "  • Technologies: React, JavaScript, CSS", style: "default" },
        { text: "  • GitHub: github.com/jackphallen/portfolio", style: "default" },
        { text: "", style: "default" },
        { text: "PROJECT 2: Data Visualization Dashboard", style: "bold" },
        { text: "  • Description: Dashboard for visualizing complex datasets with interactive components.", style: "default" },
        { text: "  • Technologies: React, D3.js, Node.js", style: "default" },
        { text: "  • Demo: example.com/dashboard", style: "default" },
        { text: "", style: "default" },
        { text: "PROJECT 3: API Gateway Service", style: "bold" },
        { text: "  • Description: Microservice architecture API gateway with authentication and rate limiting.", style: "default" },
        { text: "  • Technologies: Node.js, Express, Redis, Docker", style: "default" },
        { text: "  • GitHub: github.com/jackphallen/api-gateway", style: "default" },
    ];

    return (
        <TerminalPage
            commandText="cat assets/Projects.txt"
            content={projectsContent}
        />
    );
};

export default ProjectsPage;