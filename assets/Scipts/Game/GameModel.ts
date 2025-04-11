import { _decorator, Component, Node } from 'cc';
import { GameState, InitialState, InitialStateConfig } from './Data/GameConfig';
import { PlotStatus } from './PlotManager/PlotData';
const { ccclass, property } = _decorator;

@ccclass('GameModel')
export class GameModel extends Component {

    public static Instance: GameModel;

    private gold: number = InitialState.gold;

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
    public cows: number = 0;
    public plots: GameState['plots'] = [];

    protected start(): void {
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
                isBought: i < 3,
                status: i < 3 ? PlotStatus.Empty : PlotStatus.Locked,
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
            plots: [...this.plots]
        };
    } 

    public spendGold(amount: number): boolean {
        if (GameModel.Instance.gold >= amount) {
            GameModel.Instance.gold -= amount;
            return true;
        }
        return false;
    }
}