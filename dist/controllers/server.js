import express from "express";
import cors from "cors";
import os from "os";
import path from "path";
import sql from "mssql";
import { fileURLToPath } from "url";
import dns from "dns";
// **1. Allgemeine Konfiguration**
/**
 * Simuliert `__dirname` für ESModules
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Initialisiert die Express-App und den Port
 */
const app = express();
const PORT = 3001;
/**
 * Middleware-Konfiguration
 */
app.use(express.json()); // Middleware für JSON-Daten
app.use(express.static(path.join(__dirname, "dist"))); // Statische Dateien
app.use(cors({
    origin: "http://localhost:5173", // Erlaubt Anfragen vom Frontend
}));
// **2. Helper-Funktion: Reverse-Lookup**
/**
 * Führt einen Reverse-Lookup für die IP-Adresse des Clients durch.
 * Wenn kein Hostname gefunden wird, wird ein Fallback auf den lokalen Hostnamen verwendet.
 */
async function getClientHostname(req) {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    console.log("Ermittelte Client-IP:", clientIp);
    try {
        if (clientIp === "::1" || clientIp === "127.0.0.1") {
            const localHostname = os.hostname();
            console.log("Lokaler Hostname:", localHostname);
            return localHostname;
        }
        const hostnames = await new Promise((resolve, reject) => {
            dns.reverse(clientIp, (err, hostnames) => {
                if (err)
                    reject(err);
                else
                    resolve(hostnames);
            });
        });
        return hostnames.length > 0 ? hostnames[0] : os.hostname();
    }
    catch (err) {
        console.error("Fehler beim DNS-Reverse:", err instanceof Error ? err.message : err);
        return os.hostname();
    }
}
// **3. Datenbankkonfiguration**
/**
 * Konfiguration für den SQL Server
 */
const dbConfig = {
    server: "eude82taaSQL003.ass.local",
    database: "wac",
    authentication: {
        type: "ntlm",
        options: {
            userName: "Klaus.Reiners",
            password: "ple@seword17",
            domain: "ass",
        },
    },
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};
// **4. API-Routen**
/**
 * Route: Gibt den Hostnamen des Clients zurück.
 */
app.get("/api/hostname", async (req, res) => {
    try {
        const hostname = await getClientHostname(req);
        res.json({ hostname });
    }
    catch (err) {
        res.json({
            hostname: "unknown",
            error: err instanceof Error ? err.message : "Unbekannter Fehler",
        });
    }
});
/**
 * Route: Gibt den Benutzernamen des Systems zurück.
 */
app.get("/api/username", (req, res) => {
    const username = os.userInfo().username;
    res.json({ username });
});
/**
 * Route: Holt Daten aus der Tabelle `STEPSInsights_PerformanceProblems`.
 */
app.get("/api/data", async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
      SELECT Server, Name, Oberfläche, Bemerkung, 
             FORMAT(Zeitpunkt, 'dd.MM.yy HH:mm') AS Uhrzeit
      FROM [sao].[STEPSInsights_PerformanceProblems]
      ORDER BY Zeitpunkt DESC
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fehler bei der Datenbankverbindung:", err);
        res.status(500).send("Serverfehler bei der Datenbankabfrage");
    }
    finally {
        if (pool)
            await pool.close().catch(console.error);
    }
});
/**
 * Route: Speichert Log-Daten in der Datenbank.
 */
export const insertPerformanceLog = async (req, res) => {
    const { name, server, oberfläche, bemerkung, kategorie, zeitpunkt } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool
            .request()
            .input("Name", sql.NVarChar(255), name)
            .input("Server", sql.NVarChar(255), server)
            .input("Oberfläche", sql.NVarChar(255), oberfläche || null)
            .input("Bemerkung", sql.NVarChar(sql.MAX), bemerkung || null)
            .input("Kategorie", sql.VarChar(100), kategorie || null)
            .input("Zeitpunkt", sql.DateTime, zeitpunkt || null)
            .execute("sao.STEPSInsights_InsertPerformanceLog");
        res.status(200).send("Eintrag erfolgreich gespeichert");
    }
    catch (err) {
        console.error("Fehler beim Einfügen in die Datenbank:", err);
        res.status(500).send("Fehler beim Einfügen in die Datenbank");
    }
};
/**
 * Route: Registriere die Logging-Route mit Middleware zur Überprüfung.
 */
app.post("/api/insert-log", (req, res, next) => {
    console.log("Route /api/insert-log wurde aufgerufen");
    next();
}, insertPerformanceLog);
/**
 * Fallback-Route: Liefert die index.html für unbekannte Routen.
 */
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});
// **5. Server starten**
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
