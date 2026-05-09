import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/Dashboard';
import { ReportsPage } from './pages/Reports';
import { ReportViewPage } from './pages/ReportView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportViewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
