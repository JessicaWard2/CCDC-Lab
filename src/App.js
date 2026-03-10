import "./App.css"
import "./index.css";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header/Header";
import Home from "./Pages/Home";
import Injects from "./Pages/Injects";
import Scoreboard from "./Pages/Scoreboard";
import { TimerProvider, useTimer } from "./Time/TimerContext";

export default function App() {
  const [servicesData, setServicesData] = useState({});
  const { resetTrigger } = useTimer();

  useEffect(() => {
    fetchStatus();
  }, [resetTrigger]);

  useEffect(() => {
    //Fetch immediately
    fetchStatus();
    
    //TODO Fetch every 5 seconds change when we change api call amount
    const interval = setInterval(fetchStatus, 5000);
    
    //Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      console.log('Fetched service data:', data);
      setServicesData(data);
    } catch (error) {
      console.error('Error fetching service status:', error);
    }
  };

  return (
    <TimerProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Injects" element={<Injects />} />
        <Route path="/Scoreboard" element={<Scoreboard servicesData={servicesData} />} />
      </Routes>
    </TimerProvider>
  );
}