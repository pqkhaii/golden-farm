import { _decorator, Component, Node } from 'cc';
import { ResourceState } from './Models/Resource';
import { SETTINGS } from './Data/Settings';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    public gold: number = SETTINGS.INITIAL_GOLD;
    public resources: ResourceState = {
        tomato: 0,
        blueberry: 0,
        strawberry: 0,
        milk: 0,
    };
    public seeds = { ...SETTINGS.INITIAL_SEEDS };
    public animals = { ...SETTINGS.INITIAL_ANIMALS };
    public plots: any[] = Array(SETTINGS.INITIAL_PLOTS).fill(null);
    public workers = SETTINGS.INITIAL_WORKERS;

    private addGold(amount: number) {
        this.gold += amount;
      }
    
    private spendGold(amount: number): boolean {
        if (this.gold >= amount) {
          this.gold -= amount;
          return true;
        }
        return false;
      }
    
    private addResource(type: keyof ResourceState, amount: number) {
        this.resources[type] += amount;
    }
}


