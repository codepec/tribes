//buildings.js

const buildings = {
    farm: {
        name: 'Bauernhof',
        level: 1,
        resourceCost: { wood: 20, stone: 20, gold: 10, population:0 },
        timeToBuild: 5 // In Sekunden
    },
    barracks: {
        name: 'Kaserne',
        level: 0,
        resourceCost: { wood: 30, stone: 30, gold: 20, population:5 },
        timeToBuild: 10, // In Sekunden
        foodConsumptionPerLevel: -1
    },
    researchCenter: {
        name: 'Forschungsgebäude',
        level: 0,
        resourceCost: { wood: 350, stone: 450, gold: 130, population:10 },
        timeToBuild: 20 // In Sekunden
    },
    storage: {
        name: 'Lager',
        level: 0,
        resourceCost: { wood: 240, stone: 340, gold: 420, population:5 },
        timeToBuild: 15 // In Sekunden
    },
    vehicleWorkshop: {
        name: 'Fahrzeugwerkstätte',
        level: 0,
        resourceCost: { wood: 360, stone: 660, gold: 1040, population:25 },
        timeToBuild: 25 // In Sekunden
    }
};


const levelBuildings = {
    farmLevel:1,
    barracksLevel:0,
    researchCenterLevel:0,
    storageLevel:0,
    vehicleWorkshopLevel:0,
};