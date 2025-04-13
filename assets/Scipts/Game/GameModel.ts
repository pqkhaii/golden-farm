import { _decorator, Component, Node } from 'cc';
import { GameState, InitialState, InitialStateConfig, ProduceConfigs, ResourceType, ShopItems } from './Data/GameConfig';
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
                name: '',
                timeLeft: 0
            });
        }
    }
    
    public loadFromSave(saved: GameState): void {
        this.gold = saved.gold;
        this.workers = saved.workers;
        this.idleWorkers = saved.idleWorkers;
        this.seeds = {...saved.seeds};
        this.cows = saved.cows;
        this.plots = [...saved.plots];
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
        if (GameModel.Instance.gold >= amount) {
            GameModel.Instance.gold -= amount;
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

    public getSellableHarvestedItems(): { type: string; amount: number }[] {
        // console.log('Harvested:', this.harvested);
        const result: { type: string; amount: number }[] = [];
        for (const key in this.harvested) {
            const amount = this.harvested[key];
            if (amount > 0) {
                result.push({
                    type: key,
                    amount: amount
                });
            }
        }
    
        return result;
    }

    public sellHarvestedItem(type: ResourceType, amount: number): boolean {
        let view = GameView.Instance;
        if (this.harvested[type] < amount) {
            console.log(`Not enough ${type} to sell`);
            return false;
        }
    
        const price = ProduceConfigs[type].sellPrice;
        const totalPrice = price * amount;
    
        this.harvested[type] -= amount;
    
        this.gold += totalPrice;
        view.showNotification(`Sell ${amount} ${ProduceConfigs[type].name} and collect ${totalPrice} gold.`)
        return true;
    }
    
    public plantOrRaise(plotId: number, type: string): boolean {
        const plot = this.plots.find(p => p.id === plotId);
    
        if (plot && plot.status === PlotStatus.Empty) {
            if (type === 'tomato' || type === 'blueberry' || type === 'strawberry') {
                this.plantCrop(plot, type);
            } else if (type === 'milk') {
                this.raiseCow(plot);
            }
            PlotMapManager.Instance.updateUI(plotId);
            GameView.Instance.updateUI();
            this.updateDataGame();
            return true;
        }
    
        return false;
    }
    
    private plantCrop(plot: PlotData, cropType: string) {
        const produceConfig = ProduceConfigs[cropType];
        
        if (produceConfig && this.seeds[cropType] > 0) {
            plot.status = PlotStatus.Used; 
            plot.name = produceConfig.name;
            plot.timeLeft = produceConfig.growTime;
            this.seeds[cropType]--;
        }
    }
    
    private raiseCow(plot: PlotData) {
        if (this.cows > 0) {
            plot.status = PlotStatus.Used;
            plot.name = 'Cow';
            plot.timeLeft = ProduceConfigs.milk.growTime;
            this.cows--;
        }
    }
    
}