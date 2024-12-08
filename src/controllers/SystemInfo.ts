import { hostname } from "os";
import config from "../config/config";

export class SystemInfo {
  static async getContext() {
    try {
      const [usernameResponse, hostnameResponse] = await Promise.all([
        fetch(`${config.apiBaseUrl}/api/username`),
        fetch(`${config.apiBaseUrl}/api/hostname`),
      ]);

      if (!usernameResponse.ok || !hostnameResponse.ok) {
        throw new Error("API-Aufruf fehlgeschlagen");
      }

      const usernameData = await usernameResponse.json();
      const hostnameData = await hostnameResponse.json();

      const now = new Date();

      return {
        username: usernameData.username || "Unbekannt",
        hostname: hostnameData.hostname || "Unbekannt",
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      };
    } catch (err) {
      console.error("Fehler in SystemInfo.getContext:", err);
      return {
        username: "Unbekannt",
        hostname: "Unbekannt",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };
    }
  }
}
