import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { SystemInfo } from "../controllers/SystemInfo";
import "../config/SystemInfoComponent.css";
import axios from "axios";
// **SystemInfoComponent**
// Hauptkomponente zur Anzeige von Systeminformationen, Datenübersicht und Speichern von Logs
const SystemInfoComponent = () => {
    // **1. Zustand und Konstanten**
    // Zustand: Speichert Systeminformationen
    const [info, setInfo] = useState(null);
    // Zustand: Speichert Tabellendaten
    const [tableData, setTableData] = useState([]);
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
            }
            catch (error) {
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
            }
            catch (error) {
                // Fehlerbehandlung für unbekannten Typ
                if (error instanceof Error) {
                    console.error("Fehler beim Abrufen der Tabellendaten:", error.message);
                }
                else {
                    console.error("Unbekannter Fehler beim Abrufen der Tabellendaten:", error);
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
            const response = await axios.post("http://localhost:3001/api/insert-log", payload);
            alert(response.data);
            window.location.reload(); // Seite neu laden
        }
        catch (error) {
            console.error("Fehler beim Speichern:", error);
            if (axios.isAxiosError(error)) {
                console.error("Axios Fehlerdetails:", {
                    status: error.response?.status,
                    data: error.response?.data,
                });
                alert(`Fehler beim Speichern: ${error.response?.data || "Unbekannter Fehler"}`);
            }
        }
    };
    // **4. Rendering**
    // Ladeanzeige, wenn Systeminformationen fehlen
    if (!info) {
        return _jsx("div", { children: "Laden..." });
    }
    return (_jsxs("div", { className: "system-info-container", children: [_jsxs("div", { className: "system-info-header", children: [_jsx("h1", { children: "Performance Log Buch" }), _jsx("button", { className: "save-button", onClick: handleSave, children: "Speichern" })] }), _jsxs("div", { className: "system-info-row", children: [_jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Server:" }), " ", info.hostname] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Benutzername:" }), " ", info.username] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Datum:" }), " ", info.date] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Uhrzeit:" }), " ", info.time] })] }), _jsxs("div", { className: "table-container", children: [_jsx("h2", { children: "Daten\u00FCbersicht" }), _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsx("tr", { children: tableData.length > 0 &&
                                        Object.keys(tableData[0]).map((key) => (_jsx("th", { children: key }, key))) }) }), _jsx("tbody", { children: tableData.map((row, index) => (_jsx("tr", { children: Object.values(row).map((value, cellIndex) => (_jsx("td", { children: String(value) }, cellIndex))) }, index))) })] })] })] }));
};
// **5. Export**
export default SystemInfoComponent;
