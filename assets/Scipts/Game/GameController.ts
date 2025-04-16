import { _decorator, Component, Node } from 'cc';
import { SaveLoadManager } from './SaveData/SaveLoadManager';
import { GameModel } from './GameModel';
import { InitialState, ResourceType } from './Data/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    protected start(): void {
        const savedData = SaveLoadManager.loadGame();
        // console.log(savedData);
        if (savedData) {
            GameModel.Instance.loadFromSave(savedData);
        } else {
            GameModel.Instance.loadFromInitial(InitialState);
        }
    }
    
    private onTouchupgradeEquipment(): void {
        GameModel.Instance.upgradeEquipment();
    }
}