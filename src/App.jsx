import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import NewMeeting from './pages/NewMeeting';
import MeetingSummary from './pages/MeetingSummary';
import ActionItems from './pages/ActionItems';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meeting/new" element={<NewMeeting />} />
        <Route path="/meeting/:id/summary" element={<MeetingSummary />} />
        <Route path="/actions" element={<ActionItems />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
