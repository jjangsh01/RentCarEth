// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import AuthPage from "./pages/AuthPage";
import RolePage from "./pages/RolePage";
import OwnerPage from "./pages/OwnerPage";
import RenterPage from "./pages/RenterPage";
import KYCPage from "./pages/KYCPage";


function App() {
  return (
    <Web3Provider>
      <Router>
        
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/role" element={<RolePage />} />
          <Route path="/owner" element={<OwnerPage />} />
          <Route path="/renter" element={<RenterPage />} />
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Web3Provider>
  );
}

export default App;














