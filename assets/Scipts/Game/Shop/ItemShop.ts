import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemShop')
export class ItemShop extends Component {

    @property({type: Label})
    private nameLabel: Label;

    @property({type: Label})
    private quantityLabel: Label;

    @property({type: Label})
    private priceLabel: Label;

    @property({type: Sprite})
    private iconSprite: Sprite;

    public initItemShop(name: string, quantity: number, price: number, iconSpriteFrame: SpriteFrame): void {
        this.nameLabel.string = name;
        this.quantityLabel.string = `X${quantity}`;
        this.priceLabel.string = price.toString();
        this.iconSprite.spriteFrame = iconSpriteFrame;
    }
}


