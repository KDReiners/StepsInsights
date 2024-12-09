import React, { useState, useEffect } from "react";
import { SystemInfo } from "../controllers/SystemInfo";
import "../config/SystemInfoComponent.css";
import axios from "axios";

// **SystemInfoComponent**
// Hauptkomponente zur Anzeige von Systeminformationen, Datenübersicht und Speichern von Logs
const SystemInfoComponent: React.FC = () => {
  // **1. Zustand und Konstanten**

  // Zustand: Speichert Systeminformationen
  const [info, setInfo] = useState<{
    username: string;
    hostname: string;
    time: string;
    date: string;
  } | null>(null);

  // Zustand: Speichert Tabellendaten
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);

  // **2. useEffect-Hooks**

  /**
   * Lädt die Systeminformationen beim Laden der Komponente
   */
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const data = await SystemInfo.getContext();
        console.log("Systeminformationen:", data);
        setInfo(data);
      } catch (error) {
        console.error("Fehler beim Laden der Systeminformationen:", error);
      }
    };

    fetchSystemInfo();
  }, []);

  /**
   * Lädt die Tabellendaten von der API
   */
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/data");
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (error) {
        // Fehlerbehandlung für unbekannten Typ
        if (error instanceof Error) {
          console.error(
            "Fehler beim Abrufen der Tabellendaten:",
            error.message
          );
        } else {
          console.error(
            "Unbekannter Fehler beim Abrufen der Tabellendaten:",
            error
          );
        }
      }
    };

    fetchTableData();
  }, []);

  // **3. Handler-Funktionen**

  /**
   * Speichert die aktuellen Informationen in der Datenbank
   */
  const handleSave = async () => {
    if (!info) {
      alert("Systeminformationen sind noch nicht verfügbar.");
      return;
    }

    const payload = {
      server: info.hostname || "Unbekannter Server",
      name: info.username || "Unbekannter Benutzer",
      Zeitpunkt: new Date().toISOString(), // ISO-Format für SQL
    };

    console.log("Payload-Daten:", payload);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/insert-log",
        payload
      );
      alert(response.data);
      window.location.reload(); // Seite neu laden
    } catch (error) {
      console.error("Fehler beim Speichern:", error);

      if (axios.isAxiosError(error)) {
        console.error("Axios Fehlerdetails:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        alert(
          `Fehler beim Speichern: ${
            error.response?.data || "Unbekannter Fehler"
          }`
        );
      }
    }
  };

  // **4. Rendering**

  // Ladeanzeige, wenn Systeminformationen fehlen
  if (!info) {
    return <div>Laden...</div>;
  }

  return (
    <div className="system-info-container">
      {/* Header mit Titel und Speichern-Knopf */}
      <div className="system-info-header">
        <h1>Performance Log Buch</h1>
        <button className="save-button" onClick={handleSave}>
          Speichern
        </button>
      </div>

      {/* Anzeige der Systeminformationen */}
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

      {/* Tabelle mit den Daten */}
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

// **5. Export**
export default SystemInfoComponent;
