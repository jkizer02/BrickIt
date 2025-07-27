import React from "react";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import Generate from "./models/Generate";
import ModifyModel from "./models/modify_model";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generate />} /> 
          <Route path="/modify-model" element={<ModifyModel />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;