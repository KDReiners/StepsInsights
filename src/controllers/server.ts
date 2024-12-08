import express, { Request, Response } from "express";
import cors from "cors";
import os from "os";
import path from "path";
import sql from "mssql";
import { fileURLToPath } from "url";
import { Console } from "console";
import dns from "dns";

// Simuliert __dirname für ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Helper: Reverse-Lookup mit Fallback auf lokalen Hostnamen
async function getClientHostname(req: Request): Promise<string> {
  const clientIp =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  console.log("Ermittelte Client-IP:", clientIp);

  try {
    // Prüfen, ob es sich um localhost handelt (IPv6 `::1` oder IPv4 `127.0.0.1`)
    if (clientIp === "::1" || clientIp === "127.0.0.1") {
      const localHostname = os.hostname();
      console.log("Lokaler Hostname für  aus function localhost:", localHostname);
      return localHostname;
    }

    // Reverse-Lookup für andere IP-Adressen
    const hostnames = await new Promise<string[]>((resolve, reject) => {
      dns.reverse(clientIp as string, (err, hostnames) => {
        if (err) {
          reject(err); // Fehler weitergeben
        } else {
          resolve(hostnames); // Erfolgreiches Ergebnis zurückgeben
        }
      });
    });

    const resolvedHostname =
      hostnames.length > 0 ? hostnames[0] : os.hostname();
    console.log("Ermittelter Hostname (DNS):", resolvedHostname);
    return resolvedHostname;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Fehler beim DNS-Reverse:", err.message);
    } else {
      console.error("Unbekannter Fehler beim DNS-Reverse:", err);
    }
    return os.hostname();
  }
}

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

// Endpoint, um den Hostnamen des Clients zurückzugeben
app.get("/api/hostname", async (req: Request, res: Response) => {
  // Client-IP-Adresse ermitteln
  const clientIp =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  try {
    // Reverse-Lookup durchführen
    const hostname = await getClientHostname(req); //await reverseLookup(clientIp as string);

    const clientHostname = hostname.length > 0 ? hostname : "unknown";
    console.log("Lokaler Hostname aus api für localhost:", clientHostname);
    // Hostnamen zurückgeben
    res.json({ hostname: clientHostname });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Fehler beim Auflösen des Hostnamens:", err.message);
      res.json({ hostname: "unknown", error: err.message });
    } else {
      console.error("Unbekannter Fehler:", err);
      res.json({
        hostname: "unknown",
        error: "Ein unbekannter Fehler ist aufgetreten",
      });
    }
  }
});

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
