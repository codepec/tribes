// Gebäude-Level initialisieren
const levelBuildings = {
    farmLevel: 1,
    barracksLevel: 0,
    researchCenterLevel: 0,
    storageLevel: 0,
    vehicleWorkshopLevel: 0,
};

// Funktion zum Abrufen der Startzeit
async function getStartTime() {
    const gameState = await getGameState();
    return gameState.startTime || null; // Startzeit zurückgeben
}

// Funktion zum Speichern der Startzeit
async function saveStartTime(startTime) {
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

// Starten des DOMContentLoaded-Events
document.addEventListener("DOMContentLoaded", async () => {
    const map = document.getElementById('map');
    
    // Hole die gespeicherte Startzeit
    const startTimeFromDB = await getStartTime();
    startTime = startTimeFromDB; // Variable für die Startzeit

    // Berechne die generierten Ressourcen basierend auf der Zeit, die seit dem letzten Start vergangen ist
    calculateOfflineResources(startTime);

    // Funktion, um den Bau eines Gebäudes zu starten
    function build(type) {
        const building = buildings[type];
        if (!building) {
            console.error('Unbekannter Gebäudetyp:', type);
            return;
        }

        const cost = building.resourceCost;
        const buildingLevelKey = `${type}Level`;

        // Überprüfen, ob genügend Ressourcen vorhanden sind
        if (resources.wood < cost.wood || resources.stone < cost.stone || resources.gold < cost.gold) {
            console.log(`Nicht genügend Ressourcen für den Bau von ${building.name}.`);
            return;
        }

        if (levelBuildings[buildingLevelKey] >= 10) {
            console.log(`${building.name} hat bereits das maximale Level erreicht.`);
            return;
        }

        console.log(`Bau von ${building.name} beginnt. Dauer: ${building.timeToBuild} Sekunden.`);

        // Zeige Baufortschritt im Button an
        const buildButton = document.getElementById(`build-${type}`);
        buildButton.disabled = true; // Button deaktivieren, während das Gebäude gebaut wird
        buildButton.innerHTML = `${building.name} wird gebaut... (${building.timeToBuild} Sekunden)`;

        // Bau nach festgelegter Zeit abschließen
        setTimeout(() => {
            // Gebäude-Level erhöhen
            levelBuildings[buildingLevelKey] += 1;

            // Ressourcen abziehen
            modifyResource('wood', -cost.wood);
            modifyResource('stone', -cost.stone);
            modifyResource('gold', -cost.gold);
            modifyResource('population', 5); // Bevölkerung um 5 erhöhen

            console.log(`${building.name} wurde auf Level ${levelBuildings[buildingLevelKey]} ausgebaut.`);
            renderBuildings();

            // Button wieder aktivieren und Text zurücksetzen
            buildButton.disabled = false;
            buildButton.innerHTML = `Baue ${building.name}`;
            
            // Spielstand speichern
            saveGameState(startTime, resources, levelBuildings);
            
            // Zusätzliche Nahrungskosten für Kasernen-Level
            if (type === 'barracks') {
                modifyResource('food', levelBuildings[buildingLevelKey] * building.foodConsumptionPerLevel);
            }

            // Ressourcenanzeigen nach dem Bau aktualisieren
            displayBuildingCosts(); // Zeigt die Ressourcen an, die für die nächste Stufe benötigt werden
            displayResources();      // Aktualisiert die Anzeige der aktuellen Ressourcen

        }, building.timeToBuild * 1000); // Bauzeit in Millisekunden
    }

    // Funktion, um die Gebäude auf der Karte darzustellen
    function renderBuildings() {
        map.innerHTML = ''; // Karte leeren
        for (const type in buildings) {
            const buildingLevelKey = `${type}Level`;
            if (levelBuildings[buildingLevelKey] > 0) {
                createBuilding(buildings[type].name, levelBuildings[buildingLevelKey]);
            }
        }
    }

    // Gebäude als DOM-Element erstellen und auf die Karte setzen
    function createBuilding(name, level) {
        const building = document.createElement('div');
        building.textContent = `${name} (Level ${level})`;
        building.style.width = '100px';
        building.style.height = '50px';
        building.style.margin = '10px';
        building.style.padding = '5px';
        building.style.border = '1px solid black';
        building.style.backgroundColor = '#FFF';
        map.appendChild(building);
    }

    // Event Listener für Bau-Buttons
    const buildingTypes = ['farm', 'barracks', 'researchCenter', 'storage', 'vehicleWorkshop'];
    buildingTypes.forEach(type => {
        document.getElementById(`build-${type}`).addEventListener('click', () => build(type));
    });

    // Initialisierung der Anzeige nach dem Laden der Seite
    renderBuildings();
    displayBuildingCosts();  // Funktion zum Anzeigen der Baukosten
    displayResources();      // Funktion zum Anzeigen der aktuellen Ressourcen
    saveGameState(startTime, resources, levelBuildings);
});

// Funktion zum Anzeigen der Baukosten
function displayBuildingCosts() {
    const buildingsList = ['farm', 'barracks', 'researchCenter', 'storage', 'vehicleWorkshop'];
    buildingsList.forEach(building => {
        const cost = buildings[building].resourceCost;
        const costText = `Kosten: Holz: ${cost.wood}, Steine: ${cost.stone}, Gold: ${cost.gold}`;
        document.getElementById(`build-${building}`).innerHTML += `<br>${costText}`;
    });
}
