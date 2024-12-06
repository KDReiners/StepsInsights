import express, { Request, Response } from "express";
import cors from "cors";
import os from "os";
import path from "path";
import sql, { pool } from "mssql";

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
  server: "eude82taaSQL003", // SQL Server Hostname
  database: "wac", // Name der Datenbank
  options: {
    encrypt: true, // Wenn SSL erforderlich ist
    trustServerCertificate: true, // Für lokale Server
  },
  driver: "msnodesqlv8", // Treiber für Windows-Authentifizierung
};

// API-Route für den Benutzernamen
app.get("/api/username", (req: Request, res: Response) => {
  const username = os.userInfo().username;
  res.json({ username });
});

// API-Route für SQL-Daten
app.get("/api/data", async (req: Request, res: Response) => {
  try {
    // Verbindung herstellen
    const pool = await sql.connect(dbConfig);

    // Abfrage ausführen
    const result = await pool
      .request()
      .query("SELECT TOP 10 * FROM sao.customer_m where dt_deleted is null");

    // Ergebnisse zurückgeben
    res.json(result.recordset);
  } catch (err) {
    console.error("Fehler bei der Datenbankverbindung:", err);
    res.status(500).send("Serverfehler bei der Datenbankabfrage");
  } finally {
    // Verbindung schließen, falls geöffnet
    if (pool) {
      await pool.close();
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
