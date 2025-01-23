import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import JobRequestForm from './components/forms/JobRequestForm';
import JobsDashboard from './components/dashboard/JobsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<JobsDashboard />} />
          <Route path="request" element={<JobRequestForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
