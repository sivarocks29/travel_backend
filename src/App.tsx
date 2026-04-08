import { Routes, Route, Navigate } from 'react-router-dom';
import { fleetRoutes } from './routes/fleetRoutes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      {fleetRoutes}
    </Routes>
  );
}

export default App;
