import React from 'react';
import TerminalPage from '../components/TerminalPage';
import { PROJECTS_CONTENT } from '../content/projects';

const ProjectsPage = () => {
    return (
        <TerminalPage
            title="Projects"
            commandText="cat assets/Projects.txt"
            content={PROJECTS_CONTENT}
        />
    );
};

export default ProjectsPage;
