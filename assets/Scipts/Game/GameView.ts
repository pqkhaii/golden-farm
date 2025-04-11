import { _decorator, Component, Label, Node } from 'cc';
import { GameController } from './GameController';
import { GameModel } from './GameModel';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    public static Instance: GameView;

    @property({type: Label}) 
    private goldLabel: Label = null;
    
    @property({type: Label}) 
    private seedLabel: Label = null;
    
    @property({type: Label}) 
    private resourceLabel: Label = null;

    protected onLoad(): void {
        GameView.Instance = this;
    }

    protected start(): void {
        this.updateUI();
    }
    
    public updateUI() {
        const model = GameModel.Instance;
        this.goldLabel.string = `Gold: ${model.Gold}`;
        // this.seedLabel.string = `Seeds: T${model.seeds.tomato}, B${model.seeds.blueberry}, S${model.seeds.strawberry}`;
        // this.resourceLabel.string = `Tomato: ${model.seeds.tomato}, Blueberry: ${model.seeds.blueberry}, Milk: ${model.seeds.milk}`;
    }
    
    private onPlantTomato() {
        console.log("Plant tomato clicked");
    }
    
    private onHarvestTomato() {
        console.log("Harvest tomato clicked");
    }
    
}