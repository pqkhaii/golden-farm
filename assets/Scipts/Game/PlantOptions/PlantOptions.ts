import { _decorator, Component, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { PlotStatus } from '../PlotManager/PlotData';
import { GameModel } from '../GameModel';
const { ccclass, property } = _decorator;

@ccclass('PlantOptions')
export class PlantOptions extends Component {
    
    @property({type: Prefab})
    private buttonPrefab: Prefab;

    @property({ type: Node })
    private buttonContainer: Node;

    private currentPlot: any;

    public showAtPosition(targetNode: Node, plotData: any) {
        this.currentPlot = plotData;
        this.node.active = true;

        const worldPos = targetNode.getWorldPosition();
        const localPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        this.node.setPosition(localPos);

        this.renderButtons();
    }

    public hide() {
        this.node.active = false;
        this.buttonContainer.removeAllChildren();
    }

    private renderButtons() {
        this.buttonContainer.removeAllChildren();

        const options = [
            { label: 'Plant Tomato', type: 'tomato' },
            { label: 'Plant Blueberry', type: 'blueberry' },
            { label: 'Plant Strawberry', type: 'strawberry' },
            { label: 'Raise Cow', type: 'milk' }
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

    private onSelectOption(type: string) {
        if (this.currentPlot && this.currentPlot.status === PlotStatus.Empty) {
            GameModel.Instance.plantOrRaise(this.currentPlot.id, type);
            this.hide();
        }
    }
}


