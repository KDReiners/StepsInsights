import React, { useState, useEffect } from "react";
import { SystemInfo } from "../controllers/SystemInfo";
import "../config/SystemInfoComponent.css"; // Importiere die CSS-Datei

const SystemInfoComponent: React.FC = () => {
  const [info, setInfo] = useState<{
    username: string;
    date: string;
    timeFrom: string;
    timeTo: string;
  } | null>(null);

  useEffect(() => {
    SystemInfo.getContext().then((data) => {
      setInfo(data);
    });
  }, []);

  if (!info) {
    return <div>Laden...</div>;
  }

  return (
    <div className="system-info-container">
      <div className="system-info-header">
        <h1>Performance Log Buch</h1>
      </div>
      <div className="system-info-row">
        <div className="system-info-item">
          <strong>Benutzername:</strong> {info.username}
        </div>
        <div className="system-info-item">
          <strong>Datum:</strong> {info.date}
        </div>
        <div className="system-info-item">
          <strong>Uhrzeit von:</strong> {info.timeFrom}
        </div>
        <div className="system-info-item">
          <strong>Uhrzeit bis:</strong> {info.timeTo}
        </div>
      </div>
    </div>
  );
};

export default SystemInfoComponent;
