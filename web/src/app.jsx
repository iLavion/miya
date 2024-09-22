import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '@routes/home';
import AnimePage from '@routes/anime/main';
import NotFoundPage from '@routes/404';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;
