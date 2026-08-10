import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LinksPage from './pages/LinksPage';
import FunPage from './pages/FunPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/links" element={<LinksPage />} />
                <Route path="/fun" element={<FunPage />} />
            </Routes>
        </Router>
    );
};

export default App;
