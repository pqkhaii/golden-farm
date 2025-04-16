import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { AnimalType, EquipmentConfig, GameState, InitialState, InitialStateConfig, ProduceConfigs, ProductType, ResourceType, ResourceTypeEnum, SeedType, ShopItems, WorkerConfig } from './Data/GameConfig';
import { PlotData, PlotStatus } from './PlotManager/PlotData';
import { SaveLoadManager } from './SaveData/SaveLoadManager';
import { GameView } from './GameView';
import { PlotMapManager } from './PlotManager/PlotMapManager';
import { Constants } from './Data/Constants';
const { ccclass, property } = _decorator;

@ccclass('GameModel')
export class GameModel extends Component {

    public static Instance: GameModel;

    public gold: number = 0;

    public equipmentLevel: number = 1;
    public workers: number = 0;
    public idleWorkers: number = 0;
    public seeds: Record<string, number> = {
        tomato: 0,
        blueberry: 0,
        strawberry: 0
    };
    public harvested: Record<string, number> = {
        tomato: 0,
        blueberry: 0,
        strawberry: 0,
        milk: 0
    };
    public cows: number = 0;
    public plots: GameState['plots'] = [];

    private _workerTimer: any = null;
    private _workerTaskRunning: boolean = false;

    protected onLoad(): void {
        GameModel.Instance = this;
    }

    public loadFromInitial(initial: InitialStateConfig): void {
        this.gold = initial.gold;
        this.workers = initial.workers;
        this.idleWorkers = initial.workers;
        this.equipmentLevel = initial.equipmentLevel;
        this.seeds = {...initial.seeds};
        this.cows = initial.cows;
        this.plots = [];
        for (let i = 0; i < initial.plots; i++) {
            this.plots.push({
                id: i,
                status: PlotStatus.Empty,
                type: null,
                name: '',
                timeLeft: 0,
                yieldPerCycle: 0,
                maxYield: 0
            });
        }
    }
    
    public loadFromSave(saved: GameState): void {
        this.gold = saved.gold;
        this.workers = saved.workers;
        this.idleWorkers = saved.idleWorkers;
        this.seeds = {...saved.seeds};
        this.harvested = {...saved.harvested};
        this.cows = saved.cows;
        this.plots = [...saved.plots];
        this.equipmentLevel = saved.equipmentLevel;
    }
    
    public getState(): GameState {
        return {
            gold: this.gold,
            equipmentLevel: this.equipmentLevel,
            workers: this.workers,
            idleWorkers: this.idleWorkers,
            seeds: {
                tomato: this.seeds.tomato,
                blueberry: this.seeds.blueberry,
                strawberry: this.seeds.strawberry
            },
            cows: this.cows,
            plots: [...this.plots],
            harvested: {
                tomato: this.harvested.tomato,
                blueberry: this.harvested.blueberry,
                strawberry: this.harvested.strawberry,
                milk: this.harvested.milk
            }
        };
    } 

    public spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    public addGold(amount: number): void {
        this.gold += amount;
        console.log(this.gold);
        if(this.gold >= 1000000){
            GameView.Instance.popupWinGame.active = true;
        }
    }

    public getShopPriceById(id: string): number {
        const item = ShopItems.find(item => item.id === id);
        return item?.price ?? 0;
    }

    public updateDataGame(): void {
        SaveLoadManager.saveGame(this.getState());
    }

    //Shop
    public sellHarvestedItem(type: ResourceType, quantity: number): boolean {
        let view = GameView.Instance;
        if (this.harvested[type] < quantity) {
            // console.log(`Not enough ${type} to sell`);
            return false;
        }
    
        const price = ProduceConfigs[type].sellPrice;
        const totalPrice = price * quantity;
    
        this.harvested[type] -= quantity;
    
        this.addGold(totalPrice);
        view.showNotification(`Sell ${quantity} ${ProduceConfigs[type].name} and collect ${totalPrice} gold.`)
        view.updateUI();
        this.updateDataGame();
        return true;
    }

    public getDataHarvested(): { type: string; quantity: number, typeEnum: ResourceTypeEnum }[] {
        const result: {type: string, quantity: number, typeEnum: ResourceTypeEnum}[] = [];
        for (const key in this.harvested) {
            const value = this.harvested[key];
            if (value > 0) {
                result.push({
                    type: key, 
                    quantity: value, 
                    typeEnum: ResourceTypeEnum[key as keyof typeof ResourceTypeEnum],
                });
            }
        }
        return result;
    }
    
    //Plant or Raise
    public plantOrRaise(plotId: number, type: string): void {
        const plot = this.plots.find(p => p.id === plotId);
    
        if (plot && plot.status === PlotStatus.Empty) {
            if (type === SeedType.Tomato || type === SeedType.Blueberry || type === SeedType.Strawberry) {
                this.plantCrop(plot, type);
            } else if (type === AnimalType.Cow) {
                this.raiseCow(plot);
            }
            PlotMapManager.Instance.updateUI(plotId);
            GameView.Instance.updateUI();
            this.updateDataGame();
        }
    }
    
    private plantCrop(plot: PlotData, cropType: string): void {
        const produceConfig = ProduceConfigs[cropType];
        // console.log(produceConfig)
        // console.log('this.seeds[cropType]', this.seeds[cropType])
        
        if (produceConfig && this.seeds[cropType] > 0) {
            plot.status = PlotStatus.Used; 
            plot.name = produceConfig.name;
            plot.type = cropType;
            plot.timeLeft = produceConfig.growTime;
            plot.yieldPerCycle = produceConfig.yieldPerCycle;
            plot.maxYield = produceConfig.maxYield;
            this.seeds[cropType]--;
        } else {
            GameView.Instance.showNotification('Not Enough this seed');
        }
    }
    
    private raiseCow(plot: PlotData): void {
        if (this.cows > 0) {
            plot.status = PlotStatus.Used;
            plot.name = AnimalType.Cow;
            plot.type = ProductType.Milk;
            plot.timeLeft = ProduceConfigs.milk.growTime;
            plot.yieldPerCycle = ProduceConfigs.milk.yieldPerCycle;
            plot.maxYield = ProduceConfigs.milk.maxYield;
            this.cows--;
        } else {
            GameView.Instance.showNotification('Not enough cow');
        }
    }
    
    //Harvest
    public harvestPlot(plotId: number): void {
        let view = GameView.Instance;
        const plot = this.plots.find(p => p.id === plotId);
        if (!plot || plot.status !== PlotStatus.ReadyToHarvest) return;
    
        const type = this.getResourceTypeFromName(plot.name);
        if (type) {
            const baseYield = ProduceConfigs[type].yieldPerCycle;
            const bonusPercent = this.equipmentLevel * EquipmentConfig.yieldBoostPercent;
            const finalYield = Math.floor(baseYield * (1 + bonusPercent / 100));
    
            this.addHarvested(type as ResourceType, finalYield);
            
            let yieldPerCycle = plot.yieldPerCycle;
            let maxYield = plot.maxYield;
            // console.log('yieldPerCycle before', yieldPerCycle)
            if (yieldPerCycle <= maxYield) {
                yieldPerCycle ++;
                this.resetYieldPerCyclePlot(plot, type as ResourceType);
            } else {
                this.resetPlot(plot);
            }
            // console.log('yieldPerCycle after', yieldPerCycle)
    
            PlotMapManager.Instance.updateUI(plotId);
            view.updateUI();
            this.updateDataGame();
            view.showNotification(`Harvested ${finalYield} ${type}!`);
        }
    }

    // name to resource type
    private getResourceTypeFromName(name: string): string | null {
        switch (name.toLowerCase()) {
            case 'tomato':
            case 'blueberry':
            case 'strawberry':
                return name.toLowerCase();
            case 'cow':
                return 'milk';
            default:
                return null;
        }
    }

    public addHarvested(type: ResourceType, amount: number): void {
        if (!this.harvested[type]) {
            this.harvested[type] = 0;
        }
        this.harvested[type] += amount;
    }

    //upgrade 
    public upgradeEquipment(): boolean {
        let view = GameView.Instance;
        const upgradeCost = EquipmentConfig.upgradePrice;
        if (this.spendGold(upgradeCost)) {
            this.equipmentLevel++;
            view.showNotification(`Upgraded equipment to level ${this.equipmentLevel}. Yield increased by ${this.equipmentLevel * EquipmentConfig.yieldBoostPercent}%`);
            this.updateDataGame();
            view.updateUI();
            return true;
        } else {
            view.showNotification('Not enough gold to upgrade equipment.');
            return false;
        }
    }

    //Worker
    public hireWorkers(): void {
        const getPriceWorker = WorkerConfig.price;
        if (this.spendGold(getPriceWorker)) {
            this.idleWorkers++;
            GameView.Instance.showNotification('Hire worker successfully!');
            this.updateDataGame();
            GameView.Instance.updateUI();
        } else {
            GameView.Instance.showNotification('not enough Gold to hire worker');
        }
    }

    public startAutoWorkerTask(): void {
        if (this._workerTaskRunning) return;
    
        this._workerTaskRunning = true;
        this._workerTimer = setInterval(() => {
            this.assignWorkerTasks();
        }, 5000); 
    }
    
    private assignWorkerTasks(): void {
        if (this.idleWorkers <= 0) return;
    
        const availableSeeds = Object.keys(this.seeds).filter(seed => this.seeds[seed] > 0);
        const canRaiseCow = this.seeds[AnimalType.Cow] > 0;
    
        for (const plot of this.plots) {
            if (this.idleWorkers <= 0) break;
    
            let actionTaken = false;
    
            if (plot.status === PlotStatus.ReadyToHarvest) {
                this.harvestPlot(plot.id);
                actionTaken = true;
            } 
            else if (plot.status === PlotStatus.Empty) {
                const isPlant = randomRangeInt(0, 2);
    
                if (isPlant === 0 && canRaiseCow) {
                    this.plantOrRaise(plot.id, AnimalType.Cow);
                    actionTaken = true;
                } 
                else if (availableSeeds.length > 0) {
                    const randomSeed = availableSeeds[randomRangeInt(0, availableSeeds.length)];
                    this.plantOrRaise(plot.id, randomSeed);
                    actionTaken = true;
                }
            }
    
            if (actionTaken) {
                this.idleWorkers--;
                this.workers++;
                this.handleWorkerAction();
                this.updateDataGame();
                GameView.Instance.updateUI();
            }
        }
    }
    
    private handleWorkerAction(): void {
        setTimeout(() => {
            this.idleWorkers++;
            GameView.Instance.updateUI();
            this.updateDataGame();
        }, 120_000);
    }

    private resetPlot(plot: PlotData): void {
        plot.status = PlotStatus.Empty;
        plot.name = '';
        plot.type = '';
        plot.timeLeft = 0;
        plot.harvestedAmount = 0;
    }

    private resetYieldPerCyclePlot(plot: PlotData, cropType: ResourceType): void {
        plot.status = PlotStatus.Used;
        const produceConfig = ProduceConfigs[cropType];
        plot.timeLeft = produceConfig.growTime;
    }
}