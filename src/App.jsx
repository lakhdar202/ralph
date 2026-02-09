import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Positions from './pages/Positions';
import PositionDetail from './pages/PositionDetail';
import Analysis from './pages/Analysis';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="positions" element={<Positions />} />
                    <Route path="positions/:id" element={<PositionDetail />} />
                    <Route path="analysis" element={<Analysis />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
