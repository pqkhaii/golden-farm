import { _decorator, Button, Component, instantiate, Node, Prefab } from 'cc';
import { ResourceType, ResourceTypeEnum, ShopItems } from '../Data/GameConfig';
import { GameModel } from '../GameModel';
import { GameView } from '../GameView';
import { ItemShop } from './ItemShop';
import { SaveLoadManager } from '../SaveData/SaveLoadManager';
const { ccclass, property } = _decorator;

@ccclass('ShopController')
export class ShopController extends Component {
    
    @property({type: Prefab})
    private itemShopPrefab: Prefab;

    @property({type: Node})
    private contentParent: Node;

    protected start(): void {
        this.initialItemShop();
    }

    private initialItemShop(): void {
        const length = ShopItems.length;
        for (let i = 0; i < length; i++) {
            const data = ShopItems[i];
            const itemId = data.id;
            const name = data.name;
            const quantity = data.quantity;
            const price = data.price;
            const ResourceTypeEnum = data.ResourceTypeEnum;
            const iconSpriteFrame = GameView.Instance.getResourceSpriteFrame(ResourceTypeEnum);

            const item = instantiate(this.itemShopPrefab);
            item.parent = this.contentParent;

            const itemComponent = item.getComponent(ItemShop);
            itemComponent.initItemShop(name, quantity, price, iconSpriteFrame)

            //onclickbuy
            item.on(Node.EventType.TOUCH_END, () => {
                this.onClickBuy(itemId);
            });
        }
    }

    private onClickBuy(itemId: string): void {
        let view = GameView.Instance;
        let model = GameModel.Instance;
        const item = ShopItems.find(i => i.id === itemId);
        if (!item) return;
    
        if (model.Gold < item.price) {
            view.showNotification('Not enough gold');
            return;
        }
    
        model.Gold -= item.price;
    
        if (item.category === 'seed') {
            const resourceKey = ResourceTypeEnum[item.ResourceTypeEnum] as ResourceType;
            model.seeds[resourceKey] += item.quantity;
        } else if (item.category === 'animal') {
            model.cows += item.quantity;
        }
    
        view.updateUI();
        model.updateDataGame();
        view.showNotification('Purchase successfully');
    }

    private show(): void {
        this.node.active = true;
    }

    private hide(): void {
        this.node.active = false;
    }
}