import { _decorator, Component, Director, director, EventTouch, game, Input, input, Node } from 'cc';
import { SaveLoadManager } from './SaveData/SaveLoadManager';
import { GameModel } from './GameModel';
import { InitialState, ResourceType } from './Data/GameConfig';
import { Constants } from './Data/Constants';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    private gameModel: GameModel;

    protected start(): void {
        this.gameModel = GameModel.Instance;

        // SaveLoadManager.clearSave();
        const savedData = SaveLoadManager.loadGame();
        // console.log(savedData);
        if (savedData) {
            this.gameModel.loadFromSave(savedData);
        } else {
            this.gameModel.loadFromInitial(InitialState);
        }
        
        this.gameModel.startAutoWorkerTask();

        // input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    private onTouchupgradeEquipment(): void {
        this.gameModel.upgradeEquipment();
    }

    private onTouchHireWorker(): void {
        this.gameModel.hireWorkers();
    }

    private onTouchResetGame(): void {
        SaveLoadManager.clearSave();
        director.loadScene(Constants.SCENE_GAME);
    }

    // private onTouchStart(event: EventTouch): void {
    //     console.log('click')
    // }
}