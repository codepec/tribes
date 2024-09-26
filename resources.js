//let startTime = await getStartTime(); // Startzeit für die Berechnung der Ressourcen
const resources = {
    food: 0,
    wood: 0,
    stone: 0,
    gold: 0,
    population: 5
};

// Variable zur Speicherung der bereits erzeugten Ressourcen
let generatedResources = {
    food: 0,
    wood: 0,
    stone: 0,
    gold: 0
};

// Ressourcen Timer initialisieren
function setResourceTimers() {
    //console.log("Starte Ressourcentimer...");
    // Zuerst Offline-Ressourcen berechnen
    calculateOfflineResources();

    setInterval(() => {
        const populationFactor = resources.population > 0 ? resources.population : 1; // Bevölkerung als Multiplikator
        // Sicherstellen, dass die Gebäude existieren und initialisiert sind
        const farmLevel = buildings.farm?.level || 0;

        // Berechnung der erzeugten Ressourcen pro Sekunde pro Einwohner
        const foodGeneration = farmLevel * populationFactor * 0.5; // Nahrung
        const woodGeneration = farmLevel * populationFactor * 0.3; // Holz
        const stoneGeneration = farmLevel * populationFactor * 0.2; // Steine
        const goldGeneration = farmLevel * populationFactor * 0.1; // Gold

        // Ressourcen erhöhen
        resources.food += foodGeneration;
        resources.wood += woodGeneration;
        resources.stone += stoneGeneration;
        resources.gold += goldGeneration;

        // Abzug der Nahrung durch Kasernen-Level
        const barracksLevel = buildings.barracks?.level || 0;
        if (barracksLevel > 0) {
            resources.food -= barracksLevel; // Nahrungskosten pro Kaserne
        }

        // Sicherstellen, dass die Ressourcen nicht negativ werden
        resources.food = Math.max(resources.food, 0);
        
        // Aktualisierung der erzeugten Ressourcen (nur zur Anzeige)
        generatedResources.food = foodGeneration;
        generatedResources.wood = woodGeneration;
        generatedResources.stone = stoneGeneration;
        generatedResources.gold = goldGeneration;

        // Anzeige der Ressourcen im UI aktualisieren
        displayResources();
    }, 1000); // Alle Sekunde aktualisieren
}



// Entferne die lokale Definition von resources
function setResourceSaver() {
    // Speichern der Ressourcen alle 10 Minuten (600000 Millisekunden)
    setInterval(async () => {
        console.log("Speichern der gesammelten Ressourcen...");

        // Nutze die globale resources-Variable direkt
        const savedResources = {
            food: resources.food,  // Beispiel: aktuelle Ressourcenzahl
            wood: resources.wood,
            stone: resources.stone,
            gold: resources.gold,
            population: resources.population
        };

        // Spielstand speichern
        saveGameState(null, savedResources);
        console.log("Ressourcen erfolgreich gespeichert:", savedResources);

    }, 600000); // Alle 10 Minuten (600000 Millisekunden)
}


// Button-Element mit der entsprechenden ID auswählen
const savegameButton = document.getElementById("savegameButton");

// Click-Event Listener hinzufügen
savegameButton.addEventListener('click', () => {
    console.log("Speichern der gesammelten Ressourcen...");

        // Nutze die globale resources-Variable direkt
        const savedResources = {
            food: resources.food,  
            wood: resources.wood,
            stone: resources.stone,
            gold: resources.gold,
            population: resources.population
        };



        const savedBuildings = {
            farmLevel: levelBuildings.farmLevel,  
            barracksLevel: levelBuildings.barracksLevel,
            researchCenterLevel: levelBuildings.researchCenterLevel,
            storageLevel: levelBuildings.storageLevel,
            vehicleWorkshopLevel: levelBuildings.vehicleWorkshopLevel
        };

    // Spielstand speichern
    saveGameState(startTime, savedResources, savedBuildings);
    console.log("Ressourcen erfolgreich gespeichert:", savedResources);
    console.log("Gebäude erfolgreich gespeichert:", savedBuildings);
});


// Funktion zum Speichern des Spielstands (Beispiel)
function saveGameBeforeExit() {
    const savedResources = {
        food: resources.food,  // Beispiel: aktuelle Ressourcenzahl
        wood: resources.wood,
        stone: resources.stone,
        gold: resources.gold,
        population: resources.population
    };



    // Hier würdest du deine tatsächliche Funktion zum Speichern verwenden
    saveGameState(startTime, savedResources);
    console.log("Spielstand automatisch vor dem Verlassen der Seite gespeichert.");
}

// Ereignislistener für das Verlassen der Seite hinzufügen
window.addEventListener("beforeunload", (event) => {
    // Speichere den Spielstand
    saveGameBeforeExit();

    // Optionale Nachricht anzeigen (wird nicht immer von allen Browsern unterstützt)
    const confirmationMessage = "Bist du sicher, dass du die Seite verlassen möchtest?";
    event = confirmationMessage;  // Modernere Browser benötigen diese Zeile
    return confirmationMessage;  // Alte Browser benötigen diese Zeile
});


// Funktion zur Anzeige der Ressourcen im UI
function displayResources() {
    const resourceDetails = `
        Nahrung: ${Math.floor(resources.food)}
        Holz: ${Math.floor(resources.wood)}
        Steine: ${Math.floor(resources.stone)}
        Gold: ${Math.floor(resources.gold)}
        Bevölkerung: ${Math.floor(resources.population)}
    `;
    document.getElementById('resource-details').innerHTML = resourceDetails;
}

// Ressourcen anpassen und speichern
function modifyResource(type, amount) {
    if (resources[type] !== undefined) {
        resources[type] += amount;
        console.log(`Ressource ${type} geändert um: ${amount}. Neuer Wert: ${resources[type]}`);
        displayResources();
        saveGameState(startTime, resources); // Aktuellen Zustand speichern
    } else {
        console.error('Unbekannter Ressourcentyp:', type);
    }
}


// Initialisierung nach dem Laden der Seite
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const savedResources = await getSavedResources(); // Gespeicherte Ressourcen abrufen

        getStartTime()
            .then(startTimeFromDB => {
                if (startTimeFromDB === null) {
                    startTime = Date.now(); // Serverzeit als Startzeit setzen
                    saveStartTime(startTime); // In IndexedDB speichern
                } else {
                    startTime = startTimeFromDB; // Gespeicherte Startzeit laden
                }

                // Ressourcen mit den gespeicherten Werten initialisieren
                resources.food = savedResources.food;
                resources.wood = savedResources.wood;
                resources.stone = savedResources.stone;
                resources.gold = savedResources.gold;
                resources.population = savedResources.population;

                console.log("Ressourcen nach dem Laden:", resources);
                console.log("Gespeicherte Ressourcen:", savedResources); // Log der gespeicherten Ressourcen

                displayResources(); // Initiale Anzeige der Ressourcen
                setResourceTimers(); // Ressourcentimer starten
                displayStartTime();  // Startzeit im UI anzeigen
            })
            .catch(error => console.error("Fehler beim Laden der Startzeit:", error));
    } catch (error) {
        console.error("Fehler beim Abrufen der gespeicherten Ressourcen:", error);
    }

    setResourceSaver();  // Automatisches Speichern der Ressourcen starten
});


// Funktion zum Anzeigen der Startzeit im UI
function displayStartTime() {
    const startTimeDisplay = document.getElementById('start-time-display');
    if (startTimeDisplay) {
        const startDate = new Date(startTime);
        const formattedStartTime = startDate.toLocaleString(); // Datum und Uhrzeit formatiert
        startTimeDisplay.textContent = formattedStartTime;
    }
}

// Funktion, um zu prüfen, ob genügend Ressourcen für ein Gebäude vorhanden sind
function canAffordBuilding(building) {
    const cost = buildings[building].resourceCost;
    const canAfford = resources.wood >= cost.wood &&
                      resources.stone >= cost.stone &&
                      resources.gold >= cost.gold;

    console.log(`Kann ${building} bauen: ${canAfford}`);
    return canAfford;
}

// Ressourcen abziehen und speichern
function deductResources(building) {
    const cost = buildings[building].resourceCost;
    resources.wood -= cost.wood;
    resources.stone -= cost.stone;
    resources.gold -= cost.gold;
    
    console.log(`Ressourcen abgezogen für ${building}:`, cost);
    
    displayResources();
    saveGameState(startTime, resources); // Aktuellen Zustand speichern
}

// Bau eines Gebäudes initialisieren
function buildBuilding(building) {
    if (canAffordBuilding(building)) {
        deductResources(building);
        buildings[building].level += 1; // Gebäude-Level erhöhen
        alert(`${buildings[building].name} wurde gebaut! Level: ${buildings[building].level}`);
    } else {
        alert('Nicht genügend Ressourcen!');
    }
}

// Event Listener für Bau-Buttons
document.getElementById('build-farm').addEventListener('click', () => buildBuilding('farm'));
document.getElementById('build-barracks').addEventListener('click', () => buildBuilding('barracks'));
document.getElementById('build-researchCenter').addEventListener('click', () => buildBuilding('researchCenter'));
document.getElementById('build-storage').addEventListener('click', () => buildBuilding('storage'));
document.getElementById('build-vehicleWorkshop').addEventListener('click', () => buildBuilding('vehicleWorkshop'));

// Funktion zur Anzeige der Baukosten im UI
function displayBuildingCosts() {
    const buildingsList = ['farm', 'barracks', 'researchCenter', 'storage', 'vehicleWorkshop'];
    buildingsList.forEach(building => {
        const cost = buildings[building].resourceCost;
        const costText = `Kosten: Holz: ${cost.wood}, Steine: ${cost.stone}, Gold: ${cost.gold}`;
        console.log(`Baukosten für ${building}:`, costText);

        // Setze den inneren HTML-Inhalt auf einen leeren String, um alte Kosten zu löschen
        const buildButton = document.getElementById(`build-${building}`);
        buildButton.innerHTML = buildButton.innerHTML.split('<br>')[0]; // Lösche vorherige Kosten

        // Füge die neuen Kosten hinzu
        buildButton.innerHTML += `<br>${costText}`;
    });
}

// Funktion zur Berechnung der offline erzeugten Ressourcen
function calculateOfflineResources() {
    const currentServerTime = Date.now(); // Serverzeit verwenden
    const offlineTime = (currentServerTime - startTime) / 1000; // Zeit in Sekunden seit dem letzten Login
    
    // Startzeit im lesbaren Format anzeigen
    const formattedStartTime = new Date(startTime).toLocaleString();
    console.log("Startzeit:", formattedStartTime);

    // Umwandlung in Tage, Stunden, Minuten und Sekunden
    const days = Math.floor(offlineTime / 86400); // 86400 Sekunden in einem Tag
    const hours = Math.floor((offlineTime % 86400) / 3600); // 3600 Sekunden in einer Stunde
    const minutes = Math.floor((offlineTime % 3600) / 60); // 60 Sekunden in einer Minute
    const seconds = Math.floor(offlineTime % 60); // Restliche Sekunden

    // Ausgabe in einem lesbaren Format
    const formattedOfflineTime = `${days} Tage, ${hours} Stunden, ${minutes} Minuten, ${seconds} Sekunden`;
    console.log(formattedOfflineTime);

    // Berechnung der erzeugten Ressourcen während der Offline-Zeit
   
    const farmLevel = buildings.farm?.level || 0;

    const offlineTimeFactor = (days * 2 + hours * 1 + minutes * 0.1 + seconds * 0.01);

    console.log("offlineTimeFactor",offlineTimeFactor , farmLevel);
    // Berechnung der erzeugten Ressourcen während der Offline-Zeit
    const foodGeneration =  offlineTimeFactor * farmLevel * 10; // Nahrung
    const woodGeneration = offlineTimeFactor * farmLevel; // Holz
    const stoneGeneration = offlineTimeFactor * farmLevel; // Steine
    const goldGeneration = offlineTimeFactor * farmLevel; // Gold

    // Ressourcen erhöhen
    resources.food += foodGeneration;
    resources.wood += woodGeneration;
    resources.stone += stoneGeneration;
    resources.gold += goldGeneration;

    // Debugging: Ausgabe der erzeugten Ressourcen
    console.log(`Ressourcen nach Offline-Berechnung:
        Nahrung: ${resources.food} (Erzeugt: ${foodGeneration}),
        Holz: ${resources.wood} (Erzeugt: ${woodGeneration}),
        Steine: ${resources.stone} (Erzeugt: ${stoneGeneration}),
        Gold: ${resources.gold} (Erzeugt: ${goldGeneration})
    `);
}
