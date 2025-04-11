import { _decorator, Component, Node } from 'cc';
import { SaveLoadManager } from './SaveData/SaveLoadManager';
import { GameModel } from './GameModel';
import { InitialState, ShopConfig } from './Data/GameConfig';
import { GameView } from './GameView';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property({type: GameView})
    private gameView: GameView;

    protected onLoad(): void {
        const savedData = SaveLoadManager.loadGame();
        if (savedData) {
            GameModel.Instance.loadFromSave(savedData);
        } else {
            GameModel.Instance.loadFromInitial(InitialState);
        }
    }
}