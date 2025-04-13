import { _decorator, Component, Node, Prefab } from 'cc';
import { GameModel } from '../GameModel';
const { ccclass, property } = _decorator;

@ccclass('SellController')
export class SellController extends Component {

    @property({type: Prefab})
    private itemShopPrefab: Prefab;
    
    @property({type: Node})
    private contentParent: Node;

    protected onEnable(): void {
        this.initialItemSell();
    }

    private initialItemSell(): void {
        let model = GameModel.Instance;
        let dataHarvested = model.getSellableHarvestedItems();;
        const length = dataHarvested.length;
        console.log(dataHarvested)
        for (let i = 0; i < length; i++) {
            const data = dataHarvested[i];
            // const name = data.name;
            // const quantity = data.quantity;
            // const price = data.price;
            // const ResourceTypeEnum = data.ResourceTypeEnum;
            // const iconSpriteFrame = GameView.Instance.getResourceSpriteFrame(ResourceTypeEnum);

            // const item = instantiate(this.itemShopPrefab);
            // item.parent = this.contentParent;

            // const itemComponent = item.getComponent(ItemShop);
            // itemComponent.initItemShop(name, quantity, price, iconSpriteFrame)

            // //onclickbuy
            // item.on(Node.EventType.TOUCH_END, () => {
            //     this.onClickBuy(itemId);
            // });
        }
    }

    private show(): void {
        this.node.active = true;
    }

    private hide(): void {
        this.node.active = false;
    }
}