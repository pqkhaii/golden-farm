import { PlotData } from "../PlotManager/PlotData";

export type ResourceType = 'tomato' | 'blueberry' | 'strawberry' | 'milk';

export interface ProduceConfig {
    name: string;
    growTime: number;
    yieldPerCycle: number;
    maxYield: number;
    sellPrice: number;
    harvestWindow: number;
}

export interface InitialStateConfig {
    plots: number;
    seeds: Record<ResourceType, number>;
    cows: number;
    workers: number;
    equipmentLevel: number;
    gold: number;
    harvested: Record<ResourceType, number>;
}

export const InitialState: InitialStateConfig = {
    plots: 3,
    seeds: {
        tomato: 10,
        blueberry: 10,
        strawberry: 0,
        milk: 0
    },
    harvested: {
        tomato: 0,
        blueberry: 0,
        strawberry: 0,
        milk: 0
    },
    cows: 2,
    workers: 1,
    equipmentLevel: 1,
    gold: 2000000
};

export interface GameState {
    gold: number;
    equipmentLevel: number;
    workers: number;
    idleWorkers: number;
    seeds: {
      tomato: number;
      blueberry: number;
      strawberry: number;
    };
    cows: number;
    plots: PlotData[];
    harvested: {
        tomato: number;
        blueberry: number;
        strawberry: number;
        milk: number;
    };
}
  
export const ProduceConfigs: Record<ResourceType, ProduceConfig> = {
    tomato: {
        name: 'Cà chua',
        growTime: 600,
        yieldPerCycle: 1,
        maxYield: 40,
        sellPrice: 5,
        harvestWindow: 3600
    },
    blueberry: {
        name: 'Việt quất',
        growTime: 900,
        yieldPerCycle: 1,
        maxYield: 40,
        sellPrice: 8,
        harvestWindow: 3600
    },
    strawberry: {
        name: 'Dâu tây',
        growTime: 300,
        yieldPerCycle: 1,
        maxYield: 20,
        sellPrice: 10,
        harvestWindow: 3600
    },
    milk: {
        name: 'Sữa bò',
        growTime: 1800,
        yieldPerCycle: 1,
        maxYield: 100,
        sellPrice: 15,
        harvestWindow: 3600
    }
};

export const ShopConfig = {
    seeds: {
        tomato: 30,
        blueberry: 50,
        strawberry: 400 // 400 / 10 hạt
    },
    cow: 100,
    plot: 500,
    worker: 500,
    equipmentUpgrade: 500
};

export const WorkerConfig = {
    actionDuration: 120, // 2 phút mỗi hành động
    cost: 500
};

export const EquipmentConfig = {
    upgradeCost: 500,
    yieldBoostPercent: 10
};

export const GameGoal = {
    targetGold: 1000000
};


