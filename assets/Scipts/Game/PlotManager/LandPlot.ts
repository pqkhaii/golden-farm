import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { PlotData, PlotStatus } from './PlotData';
import { ProduceConfigs, ResourceType } from '../Data/GameConfig';
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
                this.nameLabel.string = "Empty";
                this.cdLabel.string = "";
                break;
    
            case PlotStatus.Used:
                this.background.color = new Color(100, 200, 100); // xanh
                this.nameLabel.string = this.data.name;
                console.log('plot type: ',this.data.type)
                console.log('ProduceConfigs: ',ProduceConfigs['tomato'])
                const config = ProduceConfigs[this.data.type];
                console.log(config)
                if (config) {
                    console.log(this.data.timeLeft)
                    if (this.data.timeLeft > 0) {
                        this.cdLabel.string = this.convertTime(this.data.timeLeft);
                    } else {
                        this.cdLabel.string = "Ready";
                    }
                }
                break;
    
            case PlotStatus.Harvested:
                this.background.color = new Color(255, 215, 0); // vàng
                this.nameLabel.string = this.data.name;
                this.cdLabel.string = "Harvested";
                break;
        }
    }

    private convertTime(seconds: number): string {
        console.log(seconds)
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    
}


