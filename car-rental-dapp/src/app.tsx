import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Home from "./pages/Home";
import Rent from "./pages/Rent";

const App: React.FC = () => {
  return (
    <Web3Provider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rent" element={<Rent />} />
        </Routes>
      </Router>
    </Web3Provider>
  );
};

export default App;
