import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDoubt from "./components/Doubts/StudentDoubt";
import Login from "./components/Login/Login";
import Signup from "./components/Register/Register";
import MentorDoubt from "./components/Doubts/MentorDoubt";
import MentorSchedules from "./components/Doubts/MentorSchedules";
import './App.css';
import StudentScheduleBooking from "./components/Doubts/StudentSchedules";

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/students/doubts" element={<StudentDoubt />} />
          <Route path="/admin" element={<div>Admin Page</div>} />
          <Route path="/mentor/doubts" element={<MentorDoubt />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/mentor/schedule" element={<MentorSchedules />} />
          <Route path="/student/schedule" element={<StudentScheduleBooking />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

