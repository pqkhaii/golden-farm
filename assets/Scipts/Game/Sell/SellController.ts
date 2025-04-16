import { _decorator, Component, Game, instantiate, Node, Prefab } from 'cc';
import { GameModel } from '../GameModel';
import { ProduceConfigs, ResourceType, ResourceTypeEnum } from '../Data/GameConfig';
import { ItemSell } from './ItemSell';
import { GameView } from '../GameView';
const { ccclass, property } = _decorator;

@ccclass('SellController')
export class SellController extends Component {

    @property({type: Prefab})
    private itemSellPrefab: Prefab;
    
    @property({type: Node})
    private contentParent: Node;

    private gameModel: GameModel;
    private gameView: GameView;

    protected start(): void {
        
    }

    protected onEnable(): void {
        if(!this.gameModel && !this.gameView){
            console.log('check');
            this.gameModel = GameModel.Instance;
            this.gameView = GameView.Instance;
        }
        this.initialItemSell();
    }

    private initialItemSell(): void {
        let dataHarvested = this.gameModel.getDataHarvested();
        const length = dataHarvested.length;

        this.contentParent.removeAllChildren();
        for (let i = 0; i < length; i++) {
            const data = dataHarvested[i];
            const type = data.type;
            const quantity = data.quantity;
            const typeEnum = data.typeEnum;
            const price = ProduceConfigs[type].sellPrice;
            const name = ProduceConfigs[type].name;
            const quantiySell = price * quantity;

            const iconSpriteFrame = this.gameView.getResourceSpriteFrame(typeEnum);

            const item = instantiate(this.itemSellPrefab);
            item.parent = this.contentParent;

            const itemComponent = item.getComponent(ItemSell);
            itemComponent.initItemShop(name, quantity, quantiySell, iconSpriteFrame)

            //onclickbuy
            item.off(Node.EventType.TOUCH_END);
            item.on(Node.EventType.TOUCH_END, () => {
                this.gameModel.sellHarvestedItem(type as ResourceType, quantity);
                this.onEnable();
            });
        }
    }

    private show(): void {
        this.node.active = true;
    }

    private hide(): void {
        this.node.active = false;
    }
}