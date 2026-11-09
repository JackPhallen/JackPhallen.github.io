import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LinksPage from './pages/LinksPage';
import MorrisPage from './pages/MorrisPage';
import PredictionsPage from './pages/PredictionsPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/links" element={<LinksPage />} />
                <Route path="/fun" element={<Navigate to="/fun/morris" replace />} />
                <Route path="/fun/morris" element={<MorrisPage />} />
                <Route path="/fun/predictions" element={<PredictionsPage />} />
            </Routes>
        </Router>
    );
};

export default App;
