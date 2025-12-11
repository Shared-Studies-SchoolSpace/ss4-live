import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import UniversityPage from "./pages/UniversityPage";
import UniversitiesPage from "./pages/UniversitiesPage";
import CreateUniversityPage from "./pages/CreateUniversityPage";
import CreateCourseContentPage from "./pages/CreateCourseContentPage";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/mit" element={<UniversityPage/>}/>
        <Route path="/universities" element={<UniversitiesPage/>}/>
        <Route path="/create-university" element={<CreateUniversityPage />} />
        <Route path="/create-course-content" element={<CreateCourseContentPage />} />
      </Routes>
    </Router>
  )
}