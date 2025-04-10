import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { PlotData } from './PlotData';
const { ccclass, property } = _decorator;

@ccclass('LandPlot')
export class LandPlot extends Component {

    @property({type: Label})
    private nameLabel: Label;

    @property({type: Label})
    private cdLabel: Label;

    @property({type: Sprite})
    private background: Sprite;

    private data: PlotData;

    public init(data: PlotData) {
        this.data = data;

        if (!data.isBought) {
            this.background.color = new Color(100, 100, 100); //gray
        } 
        else {
            this.background.color = new Color(200, 255, 200); //green
        }
    }

    public setTexts(name: string, time: number): void {
        this.nameLabel.string = name;
        this.cdLabel.string = time.toString();
    }
}


