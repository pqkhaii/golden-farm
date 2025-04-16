import { _decorator, Component, Node } from 'cc';
import { EquipmentConfig, GameState, InitialState, InitialStateConfig, ProduceConfigs, ResourceType, ResourceTypeEnum, ShopItems } from './Data/GameConfig';
import { PlotData, PlotStatus } from './PlotManager/PlotData';
import { SaveLoadManager } from './SaveData/SaveLoadManager';
import { GameView } from './GameView';
import { PlotMapManager } from './PlotManager/PlotMapManager';
const { ccclass, property } = _decorator;

@ccclass('GameModel')
export class GameModel extends Component {

    public static Instance: GameModel;

    private gold: number = 0;

    public get Gold() : number {
        return this.gold;
    }
    
    public set Gold(v : number) {
        this.gold = v;
    }

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
            console.log(`Not enough ${type} to sell`);
            return false;
        }
    
        const price = ProduceConfigs[type].sellPrice;
        const totalPrice = price * quantity;
    
        this.harvested[type] -= quantity;
    
        this.gold += totalPrice;
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
            if (type === 'tomato' || type === 'blueberry' || type === 'strawberry') {
                this.plantCrop(plot, type);
            } else if (type === 'cow') {
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
            plot.name = 'Cow';
            plot.type = 'milk';
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
            console.log('yieldPerCycle before', yieldPerCycle)
            if(yieldPerCycle <= maxYield){
                yieldPerCycle ++;
                this.resetYieldPerCyclePlot(plot, type as ResourceType);
            }else{
                this.resetPlot(plot);
            }
            console.log('yieldPerCycle after', yieldPerCycle)
    
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
        // this.updateDataGame();
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
    public startAutoWorkerTask(): void {
        if (this._workerTaskRunning) return;
    
        this._workerTaskRunning = true;
        this._workerTimer = setInterval(() => {
            this.assignWorkerTasks();
        }, 5000); 
    }
    
    private assignWorkerTasks(): void {
        if (this.idleWorkers <= 0) return;
    
        for (const plot of this.plots) {
            if (this.idleWorkers <= 0) break;
    
            if (plot.status === PlotStatus.ReadyToHarvest) {
                this.idleWorkers--;
                this.harvestPlot(plot.id);
                GameView.Instance.updateUI();
                this.handleWorkerAction(() => this.harvestPlot(plot.id));
            } else if (plot.status === PlotStatus.Empty) {
                // if (this.seeds['tomato'] > 0) {
                //     this.idleWorkers--;
                //     this.handleWorkerAction(() => this.plantOrRaise(plot.id, 'tomato'));
                // }
            }
        }
    }
    
    private handleWorkerAction(action: () => void): void {
        setTimeout(() => {
            action();
            this.idleWorkers++;
            GameView.Instance.updateUI();
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