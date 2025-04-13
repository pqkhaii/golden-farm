import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { PlotData, PlotStatus } from './PlotData';
const { ccclass, property } = _decorator;

@ccclass('LandPlot')
export class LandPlot extends Component {

    @property({type: Label})
    private nameLabel: Label;

    @property({type: Label})
    private cdLabel: Label;

    @property({type: Sprite})
    private background: Sprite;

    public data: PlotData;

    public init(data: PlotData) {
        this.data = data;
        this.updateUI();
    }

    public updateUI(): void {
        switch (this.data.status) {
            case PlotStatus.Empty:
                this.background.color = new Color(150, 150, 150); // xám
                break;
            case PlotStatus.Used:
                this.background.color = new Color(100, 200, 100); // xanh
                break;
            case PlotStatus.Harvested:
                this.background.color = new Color(255, 215, 0); // vàng
                break;
        }

        this.nameLabel.string = this.data.name;
        this.cdLabel.string = this.data.timeLeft > 0 ? this.data.timeLeft.toString() : "Ready";
    }
}


