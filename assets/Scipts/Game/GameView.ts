import { _decorator, Component, Label, Node } from 'cc';
import { GameModel } from './GameModel';
import { PlotStatus } from './PlotManager/PlotData';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    public static Instance: GameView;

    @property({type: Label}) 
    private goldLabel: Label = null;

    @property({type: Label}) 
    private equipmentLabel: Label = null;

    @property({type: Label}) 
    private workerLabel: Label = null;

    @property({type: Label}) 
    private seedLabel: Label = null;
    
    @property({type: Label}) 
    private plotLabel: Label = null;

    @property({type: Label}) 
    private harvestedLabel: Label = null;

    protected onLoad(): void {
        GameView.Instance = this;
    }

    protected start(): void {
        this.updateUI();
    }
    
    public updateUI() {
        const model = GameModel.Instance;
        this.goldLabel.string = model.Gold.toString();
        
        //equipment
        this.equipmentLabel.string = model.equipmentLevel.toString();

        //worker
        this.workerLabel.string = `${model.workers - model.idleWorkers} busy / ${model.idleWorkers} idle`;

        //seeds
        this.seedLabel.string = `${model.seeds.tomato} 🍅 | ${model.seeds.blueberry} 🍒 | ${model.seeds.strawberry} 🍓`;

        //plot
        const used = model.plots.filter(p => p.status === PlotStatus.Used).length;
        const empty = model.plots.filter(p => p.status === PlotStatus.Empty).length;
        this.plotLabel.string = `${used} used / ${empty} empty`;

        //harvested
        this.harvestedLabel.string = `${model.harvested.tomato} 🍅 | ${model.harvested.blueberry} 🍒 | ${model.harvested.strawberry} 🍓 | ${model.harvested.milk} 🥛`;

    }
    
    private onPlantTomato() {
        console.log("Plant tomato clicked");
    }
    
    private onHarvestTomato() {
        console.log("Harvest tomato clicked");
    }
    
}