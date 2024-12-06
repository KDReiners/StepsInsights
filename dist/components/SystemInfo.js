import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { SystemInfo } from "../controllers/SystemInfo";
import "../config/SystemInfoComponent.css"; // Importiere die CSS-Datei
const SystemInfoComponent = () => {
    const [info, setInfo] = useState(null);
    useEffect(() => {
        SystemInfo.getContext().then((data) => {
            setInfo(data);
        });
    }, []);
    if (!info) {
        return _jsx("div", { children: "Laden..." });
    }
    return (_jsxs("div", { className: "system-info-container", children: [_jsx("div", { className: "system-info-header", children: _jsx("h1", { children: "Performance Log Buch" }) }), _jsxs("div", { className: "system-info-row", children: [_jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Benutzername:" }), " ", info.username] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Datum:" }), " ", info.date] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Uhrzeit von:" }), " ", info.timeFrom] }), _jsxs("div", { className: "system-info-item", children: [_jsx("strong", { children: "Uhrzeit bis:" }), " ", info.timeTo] })] })] }));
};
export default SystemInfoComponent;
