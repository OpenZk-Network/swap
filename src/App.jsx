// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Swap from "./components/Swap";
import Pools from "./components/Pools";

function Home() {
  return (
    <div className="container mt-5 text-center">
      <h1>zkSwap</h1>
      <p>A simple token swap interface</p>
      <div className="d-flex justify-content-center gap-3">
        <Link to="/swap" className="btn btn-primary">
          Swap
        </Link>
        <Link to="/pools" className="btn btn-outline-primary">
          Pools
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            Swap App
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/swap">
                  Swap
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pools">
                  Pools
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/pools" element={<Pools />} />
      </Routes>
    </Router>
  );
}

export default App;