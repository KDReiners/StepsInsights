import express, { Request, Response } from "express";
import cors from "cors";
import os from "os";
import path from "path";
import sql from "mssql";
import { fileURLToPath } from "url";
import { Console } from "console";

// Simuliert __dirname für ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// CORS aktivieren
app.use(
  cors({
    origin: "http://localhost:5173", // Erlaubt Anfragen von deinem Frontend
  })
);

// SQL Server Konfiguration
const dbConfig: sql.config = {
  server: "eude82taaSQL003.ass.local", // SQL Server Hostname
  database: "wac", // Name der Datenbank
  authentication: {
    type: "ntlm", // Windows-Authentifizierung
    options: {
      userName: "Klaus.Reiners", // Dein Windows-Benutzername
      password: "ple@seword17", // Dein Passwort
      domain: "ass", // Domäne des Servers
    },
  },
  options: {
    encrypt: true, // Wenn SSL erforderlich ist
    trustServerCertificate: true, // Für lokale Server
  },
};

// API-Route für den Benutzernamen
app.get("/api/username", (req: Request, res: Response) => {
  const username = os.userInfo().username;
  res.json({ username });
});

// API-Route für SQL-Daten
app.get("/api/data", async (req: Request, res: Response) => {
  let pool: sql.ConnectionPool | undefined;

  try {
    // Verbindung herstellen
    console.error("versuche Verbindung");

    pool = await sql.connect(dbConfig);
    console.error("pool ist da da:");
    // Abfrage ausführen
    const result = await pool.request().query(`
       select Server, Name, Oberfläche, Bemerkung, format(zeitpunkt, 'dd.MM.yy HH:mm') as Uhrzeit from [sao].[STEPSInsights_PerformanceProblems]
      order by Zeitpunkt desc`);

    // Ergebnisse zurückgeben
    res.json(result.recordset);
  } catch (err) {
    console.error("Fehler bei der Datenbankverbindung:", err);
    res.status(500).send("Serverfehler bei der Datenbankabfrage");
  } finally {
    try {
      // Verbindung schließen, falls initialisiert
      if (pool) {
        await pool.close();
        console.log("Datenbankverbindung geschlossen.");
      }
    } catch (closeErr) {
      console.error("Fehler beim Schließen der Verbindung:", closeErr);
    }
  }
});

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, "dist")));

// Fallback für andere Routen
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
