import { PlotData } from "../PlotManager/PlotData";

export type ResourceType = 'tomato' | 'blueberry' | 'strawberry' | 'milk';

export enum ResourceTypeEnum {
    tomato = 0,
    blueberry = 1,
    strawberry = 2,
    milk = 3,
    cow = 4
}

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
}

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
        name: 'Tomato',
        growTime: 600,
        yieldPerCycle: 1,
        maxYield: 40,
        sellPrice: 5,
        harvestWindow: 3600
    },
    blueberry: {
        name: 'Blueberry',
        growTime: 900,
        yieldPerCycle: 1,
        maxYield: 40,
        sellPrice: 8,
        harvestWindow: 3600
    },
    strawberry: {
        name: 'Strawberry',
        growTime: 300,
        yieldPerCycle: 1,
        maxYield: 20,
        sellPrice: 10,
        harvestWindow: 3600
    },
    milk: {
        name: 'Milk',
        growTime: 1800,
        yieldPerCycle: 1,
        maxYield: 100,
        sellPrice: 15,
        harvestWindow: 3600
    }
}

/** Shop Config */
type ShopItem = {
    id: string;
    name: string;
    category: 'seed' | 'animal' | 'land' | 'worker' | 'upgrade';
    price: number;
    quantity: number;
    ResourceTypeEnum: ResourceTypeEnum;
}

export const ShopItems: ShopItem[] = [
    { id: 'seed_tomato', name: 'Tomato', category: 'seed', price: 30, quantity: 1, ResourceTypeEnum: ResourceTypeEnum.tomato },
    { id: 'seed_blueberry', name: 'Blueberry', category: 'seed', price: 50, quantity: 1, ResourceTypeEnum: ResourceTypeEnum.blueberry },
    { id: 'seed_strawberry', name: 'Strawberry', category: 'seed', price: 400, quantity: 10, ResourceTypeEnum: ResourceTypeEnum.strawberry },
    { id: 'cow', name: 'Cow', category: 'animal', price: 100, quantity: 1, ResourceTypeEnum: ResourceTypeEnum.cow },
]

export enum ShopItemID {
    TomatoSeed = 'tomatoSeed',
    BlueberrySeed = 'blueberrySeed',
    StrawberrySeed = 'strawberrySeed',
    Cow = 'cow',
}
/** */

export const WorkerConfig = {
    actionDuration: 120,
    price: 500
}

export const EquipmentConfig = {
    yieldBoostPercent: 10,
    upgradePrice: 500
}

export const plotConfig = {
    price: 500
}

export const GameGoal = {
    targetGold: 1000000
}