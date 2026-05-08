import { BrowserRouter, Route, Routes } from 'react-router-dom';
import XP from './components/XP';
import AdminXP from './components/XP/Admin';

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route index element={<XP />} />
      <Route path={'__admin__'} element={<AdminXP />} />
    </Routes>
  </BrowserRouter>
}
