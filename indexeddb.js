const dbName = "GameDB";
const storeName = "GameStore"; // Store umbenennen für Klarheit


// Funktion zum Abrufen der Startzeit
async function getStartTime() {
    const gameState = await getGameState();  // Asynchrone Abruf der Spielstands-Daten
    let startTime;

    if (!gameState.startTime) {  // Wenn keine Startzeit vorhanden ist
        startTime = Date.now();   // Setze aktuelle Zeit als Startzeit
        console.log("Keine Startzeit gefunden, setze aktuelle Zeit:", startTime);
        await saveStartTime(startTime);  // Speichere die Startzeit in der Datenbank
    } else {
        startTime = gameState.startTime;  // Wenn Startzeit vorhanden, verwende diese
        console.log("Startzeit aus der Datenbank:", startTime);
    }

    return startTime;  // Gib die Startzeit zurück, egal ob neu gesetzt oder aus DB
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 15); // Version 3 verwenden
        request.onupgradeneeded = event => {
            const db = event.target.result;
            console.log("Upgrade benötigt, erstellte Object Store:", storeName);
            if (!db.objectStoreNames.contains(storeName)) {
                // Erstelle den Object Store, wenn er nicht existiert
                db.createObjectStore(storeName, { keyPath: "id" });
                console.log(`Object Store '${storeName}' erstellt.`);
            }
        };
        request.onsuccess = event => {
            console.log("Datenbank erfolgreich geöffnet:", dbName);
            resolve(event.target.result);
        };
        request.onerror = event => {
            console.error("Fehler beim Öffnen der Datenbank:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Funktion zum Speichern des Spielstands
function saveGameState(startTime, resources, levelBuildings) {
    console.log("Speichere Spielstand...");
    openDatabase().then(db => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        // Speichere die Werte
        console.log("Speichere Startzeit:", startTime);
        store.put({ id: "startTime", value: startTime });

       // Speichere die Ressourcen
       const resourceEntries = [
        { id: "foodSaved", value: resources.food },
        { id: "woodSaved", value: resources.wood },
        { id: "stoneSaved", value: resources.stone },
        { id: "goldSaved", value: resources.gold },
        { id: "populationSaved", value: resources.population }
    ];

    resourceEntries.forEach(entry => {
        console.log(`Speichere Ressource ${entry.id}:`, entry.value);
        store.put(entry);
    });



    // Speichere die Level der Gebäude
    const buildingEntries = [
        { id: "farmLevel", value: levelBuildings.farmLevel },
        { id: "barracksLevel", value: levelBuildings.barracksLevel },
        { id: "researchCenterLevel", value: levelBuildings.researchCenterLevel },
        { id: "storageLevel", value: levelBuildings.storageLevel },
        { id: "vehicleWorkshopLevel", value: levelBuildings.vehicleWorkshopLevel }
    ];

    buildingEntries.forEach(entry => {
        console.log(`Speichere Gebäude ${entry.id}:`, entry.value);
        store.put(entry);
    });

    transaction.oncomplete = () => {
        console.log("Spielstand erfolgreich gespeichert.");
    };
    transaction.onerror = event => {
        console.error("Fehler beim Speichern des Spielstands:", event.target.error);
    };
}).catch(error => console.error("IndexedDB Fehler:", error));
}

// Funktion zum Abrufen des Spielstands
function getGameState() {
    return new Promise((resolve, reject) => {
        openDatabase().then(db => {
            const transaction = db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.getAll(); // Holen Sie alle Daten

            request.onsuccess = event => {
                const results = event.target.result.reduce((acc, item) => {
                    acc[item.id] = item.value;
                    return acc;
                }, {});
                console.log("Spielstand abgerufen:", results);

                // Setze die Level der Gebäude
                for (const [key] of Object.entries(buildings)) {
                    results[`${key}Level`] = results[`${key}Level`] || 0; // Setze auf 0, wenn nicht vorhanden
                }

                resolve(results);
            };
            request.onerror = event => {
                console.error("Fehler beim Abrufen des Spielstands:", event.target.error);
                reject(event.target.error);
            };
        }).catch(error => console.error("IndexedDB Fehler:", error));
    });
}

// Funktion zum Speichern der Startzeit
function saveStartTime(startTime) {
    console.log("Speichere Startzeit:", startTime);
    openDatabase().then(db => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.put({ id: "startTime", value: startTime });

        transaction.oncomplete = () => {
            console.log("Startzeit erfolgreich gespeichert.");
        };
        transaction.onerror = event => {
            console.error("Fehler beim Speichern der Startzeit:", event.target.error);
        };
    }).catch(error => console.error("IndexedDB Fehler:", error));
}



// Funktion zum Abrufen der gespeicherten Ressourcen
async function getSavedResources() {
    const gameState = await getGameState();
    const resources = {
        food: gameState.foodSaved || 0,
        wood: gameState.woodSaved || 0,
        stone: gameState.stoneSaved || 0,
        gold: gameState.goldSaved || 0,
        population: gameState.populationSaved || 0
    };
    console.log("Gespeicherte Ressourcen abgerufen:", resources);
    return resources;
}



// Stelle sicher, dass die initialen Werte gesetzt werden
function initializeDatabaseWithDefaults() {
    console.log("Initialisiere Datenbank mit Standardwerten...");
    openDatabase().then(db => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        // Setze hier Standardwerte für Ressourcen
        const defaultValues = {
            startTime: Date.now(),
            foodSaved: 0,
            woodSaved: 0,
            stoneSaved: 0,
            goldSaved: 0,
            populationSaved: 5,
            farmLevel: 1, // Beispiel-Standardwert
            barracksLevel: 0,
            researchCenterLevel: 0,
            storageLevel: 0,
            vehicleWorkshopLevel: 0,
        };

        for (const [key, value] of Object.entries(defaultValues)) {
            console.log(`Setze Standardwert für ${key}:`, value);
            store.put({ id: key, value });
        }

        transaction.oncomplete = () => {
            console.log("Standardwerte erfolgreich gespeichert.");
        };
        transaction.onerror = event => {
            console.error("Fehler beim Speichern der Standardwerte:", event.target.error);
        };
    }).catch(error => console.error("IndexedDB Fehler:", error));
}

// Initialisierung der Datenbank beim ersten Laden der Seite
document.addEventListener("DOMContentLoaded", async () => {
    const gameState = await getGameState();

    // Überprüfen, ob die Datenbank bereits Werte hat
    if (Object.keys(gameState).length === 0) {
        console.log("Keine Werte gefunden, initialisiere mit Standardwerten...");
        await initializeDatabaseWithDefaults();  // Setze Standardwerte
    }

    // Überprüfe die Startzeit und setze sie, falls sie nicht existiert
    const startTime = await getStartTime();
    console.log("Startzeit abgerufen:", startTime);

    // Lade den Spielstand
    const { startTime: loadedStartTime, resources } = await loadGameState();
    console.log("Spielstand geladen:", loadedStartTime, resources);
});

// Funktion zum Abrufen der gespeicherten Ressourcen und Gebäude-Level
async function loadGameState() {
    const gameState = await getGameState();
    const startTime = gameState.startTime || Date.now();
    const resources = {
        food: gameState.foodSaved || 0,
        wood: gameState.woodSaved || 0,
        stone: gameState.stoneSaved || 0,
        gold: gameState.goldSaved || 0,
        population: gameState.populationSaved || 0
    };

    // Setze die Level der Gebäude
    const buildings = {
        farmLevel: gameState.farmLevel || 0,
        barracksLevel: gameState.barracksLevel || 0,
        researchCenterLevel: gameState.researchCenterLevel || 0,
        storageLevel: gameState.storageLevel || 0,
        vehicleWorkshopLevel: gameState.vehicleWorkshopLevel || 0
    };

    for (const [key, value] of Object.entries(buildings)) {
        console.log(`Setze Level für ${key}:`, value);
    }

    return { startTime, resources, buildings };
}