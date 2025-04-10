import { _decorator, Component, Label, Node } from 'cc';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    @property({type: Label}) 
    private goldLabel: Label = null;
    
    @property({type: Label}) 
    private seedLabel: Label = null;
    
    @property({type: Label}) 
    private resourceLabel: Label = null;

    private gameController: GameController = new GameController();

    protected onLoad() {
        this.updateUI();
    }
    
    public updateUI() {
        this.goldLabel.string = `Gold: ${this.gameController.gold}`;
        this.seedLabel.string = `Seeds: T${this.gameController.seeds.tomato}, B${this.gameController.seeds.blueberry}`;
        this.resourceLabel.string = `Tomato: ${this.gameController.resources.tomato}, Blueberry: ${this.gameController.resources.blueberry}, Milk: ${this.gameController.resources.milk}`;
    }
    
    private onPlantTomato() {
        console.log("Plant tomato clicked");
    }
    
    private onHarvestTomato() {
        console.log("Harvest tomato clicked");
    }
    
}