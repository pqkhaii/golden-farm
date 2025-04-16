import { _decorator, assetManager, Component, Director, director, EventTouch, game, Input, input, Node, resources, TextAsset } from 'cc';
import { SaveLoadManager } from './SaveData/SaveLoadManager';
import { GameModel } from './GameModel';
import { InitialState, ResourceType } from './Data/GameConfig';
import { Constants } from './Data/Constants';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    private gameModel: GameModel;

    protected async start(): Promise<void> {
        this.gameModel = GameModel.Instance;

        const savedData = SaveLoadManager.loadGame();
        // console.log(savedData);
        if (savedData) {
            this.gameModel.loadFromSave(savedData);
        } else {
            this.gameModel.loadFromInitial(InitialState);
        }
        
        this.gameModel.startAutoWorkerTask();

        this.getDataCSV();
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

    private getDataCSV(): void {
        resources.load('FileCSV/initial_state', TextAsset, (err, asset) => {
            if (err || !asset) {
                console.error('Load CSV failed:', err);
                return;
            }
        
            const text = asset.text;
            console.log('CSV:', text);
        });
    }
}