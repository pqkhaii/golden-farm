import { _decorator, Component, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { PlotStatus } from '../PlotManager/PlotData';
import { GameModel } from '../GameModel';
import { AnimalType, SeedType } from '../Data/GameConfig';
const { ccclass, property } = _decorator;

@ccclass('PlantOptions')
export class PlantOptions extends Component {
    
    @property({type: Prefab})
    private buttonPrefab: Prefab;

    @property({type: Node})
    private buttonContainer: Node;

    @property({type: Node})
    private bgNode: Node;

    private currentPlot: any;

    public showAtPosition(targetNode: Node, plotData: any) {
        this.currentPlot = plotData;
        this.node.active = true;

        const worldPos = targetNode.getWorldPosition();
        const localPos = this.bgNode.parent.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        this.bgNode.setPosition(localPos);

        this.renderButtons();
    }

    public hide() {
        this.node.active = false;
        this.buttonContainer.removeAllChildren();
    }

    private renderButtons() {
        this.buttonContainer.removeAllChildren();

        const options = [
            { label: 'Plant Tomato', type: SeedType.Tomato },
            { label: 'Plant Blueberry', type: SeedType.Blueberry },
            { label: 'Plant Strawberry', type: SeedType.Strawberry },
            { label: 'Raise Cow', type: AnimalType.Cow }
        ];

        for (const option of options) {
            const btnNode = instantiate(this.buttonPrefab);
            btnNode.getChildByName('Label').getComponent(Label).string = option.label;
            this.buttonContainer.addChild(btnNode);

            btnNode.on(Node.EventType.TOUCH_END, () => {
                this.onSelectOption(option.type);
            });
        }
    }

    private onSelectOption(type: string): void {
        if (this.currentPlot && this.currentPlot.status === PlotStatus.Empty) {
            GameModel.Instance.plantOrRaise(this.currentPlot.id, type);
            this.hide();
        }
    }
}