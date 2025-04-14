import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SaveLoadManager')
export class SaveLoadManager extends Component {

    private static SAVE_KEY = 'GoldenFarm_SaveData';

    public static saveGame(data: any): void {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(this.SAVE_KEY, jsonData);
        // console.log('Save Load', data);
    }

    public static loadGame(): any | null {
        const jsonData = localStorage.getItem(this.SAVE_KEY);
        if (jsonData) {
        const data = JSON.parse(jsonData);
        // console.log('Load game', data);
        return data;
        }
        return null;
    }

    public static clearSave(): void {
        localStorage.removeItem(this.SAVE_KEY);
        // console.log('delete');
    }
}


