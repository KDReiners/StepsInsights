import React, { useState, useEffect } from "react";
import { SystemInfo } from "../controllers/SystemInfo";
import "../config/SystemInfoComponent.css";

const SystemInfoComponent: React.FC = () => {
  const [info, setInfo] = useState<{
    username: string;
    hostname: string; // Hostname hinzugefügt
    date: string;
    time: string;
  } | null>(null);

  const [tableData, setTableData] = useState<Record<string, any>[]>([]); // Typ für die Tabelle angepasst

  // Daten für SystemInfo abrufen
  useEffect(() => {
    SystemInfo.getContext().then((data) => {
    setInfo(data); // Daten in den Zustand setzen
    });
  }, []);

  // Daten für die Tabelle abrufen
  useEffect(() => {
    fetch("http://localhost:3001/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setTableData(data); // Tabelle mit Daten füllen
      })
      .catch((error) =>
        console.error("Fehler beim Abrufen der Daten:", error.message)
      );
  }, []);

  // Klick-Handler für den "Speichern"-Knopf
  const handleSave = () => {
    console.log("Speichern geklickt!");
    // Hier kannst du die Logik für das Speichern hinzufügen
  };

  if (!info) {
    return <div>Laden...</div>;
  }

  return (
    <div className="system-info-container">
      <div className="system-info-header">
        <h1>Performance Log Buch</h1>
        <button className="save-button" onClick={handleSave}>
          Speichern
        </button>
      </div>
      <div className="system-info-row">
      <div className="system-info-item">
          <strong>Server:</strong> {info.hostname}
        </div>
        <div className="system-info-item">
          <strong>Benutzername:</strong> {info.username}
        </div>
        <div className="system-info-item">
          <strong>Datum:</strong> {info.date}
        </div>
        <div className="system-info-item">
          <strong>Uhrzeit:</strong> {info.time}
        </div>
      </div>
      <div className="table-container">
        <h2>Datenübersicht</h2>
        <table className="data-table">
          <thead>
            <tr>
              {tableData.length > 0 &&
                Object.keys(tableData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemInfoComponent;
