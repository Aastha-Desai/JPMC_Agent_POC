import {Route, Routes} from "react-router";
import Dashboard from "./pages/Dashboard";
import NewPressRelease from "./pages/NewPressRelease";
import Processing from "./pages/Processing";

function App() {
  return(
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/new" element={<NewPressRelease />} />
      <Route path="/processing" element={<Processing />} />
    </Routes>
  );
}

export default App;