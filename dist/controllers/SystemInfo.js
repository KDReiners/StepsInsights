import config from "../config/config";
export class SystemInfo {
    static async getContext() {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/username`);
            if (!response.ok) {
                throw new Error(`API-Fehler: ${response.status}`);
            }
            const data = await response.json();
            const now = new Date();
            const date = now.toLocaleDateString();
            const timeFrom = new Date(now.getTime() - 10 * 60 * 1000).toLocaleTimeString();
            const timeTo = new Date(now.getTime() + 10 * 60 * 1000).toLocaleTimeString();
            return {
                username: data.username || "Unbekannt",
                date,
                timeFrom,
                timeTo,
            };
        }
        catch (error) {
            console.error("Fehler in SystemInfo.getContext:", error);
            const now = new Date();
            const date = now.toLocaleDateString();
            const timeFrom = new Date(now.getTime() - 10 * 60 * 1000).toLocaleTimeString();
            const timeTo = new Date(now.getTime() + 10 * 60 * 1000).toLocaleTimeString();
            return {
                username: "Unbekannt",
                date,
                timeFrom,
                timeTo,
            };
        }
    }
}
