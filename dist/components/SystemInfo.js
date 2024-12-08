import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { SystemInfo } from "../controllers/SystemInfo";
import "../config/SystemInfoComponent.css";
const SystemInfoComponent = () => {
    const [info, setInfo] = useState(null);
    const [tableData, setTableData] = useState([]); // Typ für die Tabelle angepasst
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
            .catch((error) => console.error("Fehler beim Abrufen der Daten:", error.message));
    }, []);
    // Klick-Handler für den "Speichern"-Knopf
    const handleSave = () => {
        console.log("Speichern geklickt!");
        // Hier kannst du die Logik für das Speichern hinzufügen
    };
    if (!info) {
        return _jsx("div", { children: "Laden..." });
    }
    return (_jsxs("div", { className: "system-info-container", children: [_jsxs("div", { className: "system-info-header", children: [_jsx("h1", { children: "Performance Log Buch" }), _jsx("button", { className: "save-button", onClick: handleSave, children: "Speichern" })] }), _jsxs("div", { className: "system-info-row", children: [_jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Server:" }), " ", info.hostname] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Benutzername:" }), " ", info.username] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Datum:" }), " ", info.date] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Uhrzeit:" }), " ", info.time] })] }), _jsxs("div", { className: "table-container", children: [_jsx("h2", { children: "Daten\u00FCbersicht" }), _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsx("tr", { children: tableData.length > 0 &&
                                        Object.keys(tableData[0]).map((key) => (_jsx("th", { children: key }, key))) }) }), _jsx("tbody", { children: tableData.map((row, index) => (_jsx("tr", { children: Object.values(row).map((value, cellIndex) => (_jsx("td", { children: String(value) }, cellIndex))) }, index))) })] })] })] }));
};
export default SystemInfoComponent;
