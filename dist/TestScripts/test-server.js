import axios from "axios";
const testApi = async () => {
    try {
        // Teste die Verbindung zur API
        const response = await axios.get("http://localhost:3001/api/data");
        console.log("Daten erfolgreich abgerufen:", response.data);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Fehler beim Abrufen der Daten: und das ist KLasse", err.message);
        }
        else {
            console.error("Unbekannter Fehler:", err);
        }
    }
};
testApi();
