import { _decorator, Component, instantiate, Node, Prefab, Settings, UITransform, Vec3 } from 'cc';
import { PlotData, PlotStatus } from './PlotData';
import { LandPlot } from './LandPlot';
import { GameModel } from '../GameModel';
import { GameView } from '../GameView';
import { plotConfig, ShopItemID } from '../Data/GameConfig';
import { PlantOptions } from '../PlantOptions/PlantOptions';
const { ccclass, property } = _decorator;

@ccclass('PlotMapManager')
export class PlotMapManager extends Component {

    public static Instance: PlotMapManager;
    
    @property({type: Prefab})
    private landPlotPrefab: Prefab;

    @property({type: Prefab})
    private buyPlotPrefab: Prefab;

    private landPlotPool: Node[] = [];

    private buyPlotNode: Node = null;

    @property({type: PlantOptions})
    private plantOptions: PlantOptions;

    protected onLoad(): void {
        PlotMapManager.Instance = this;
    }

    protected start() {
        this.initPlots();
    }

    private initPlots() {
        const plotDataList = GameModel.Instance.plots;
        for (const data of plotDataList) {
            const plotNode = instantiate(this.landPlotPrefab);
            this.landPlotPool.push(plotNode);
            this.node.addChild(plotNode);

            let plotComponent = plotNode.getComponent(LandPlot);
            plotComponent.init(data);

            //add event click plot
            plotNode.on(Node.EventType.TOUCH_END, () => {
                const plotData = plotComponent.data;
                if (plotData.status === PlotStatus.Empty) {
                    this.plantOptions.showAtPosition(plotNode, plotData)
                }
            });
        }
        this.createBuyPlotButton();
    }

      
    private createBuyPlotButton(): void {
        this.buyPlotNode = instantiate(this.buyPlotPrefab);
        this.node.addChild(this.buyPlotNode);
    
        this.buyPlotNode.on(Node.EventType.TOUCH_END, () => {
            this.onBuyPlot();
        });
    }
      
    private onBuyPlot(): void {
        let model = GameModel.Instance;
        let view = GameView.Instance;
        const spendGold = model.spendGold(plotConfig.price);
        if(spendGold){
            view.updateUI();

            const id = model.plots.length;
            const newPlotData = {
                id,
                isBought: true,
                status: PlotStatus.Empty,
                name: "",
                timeLeft: 0
            };
            model.plots.push(newPlotData);
        
            const newPlotNode = instantiate(this.landPlotPrefab);
            this.node.insertChild(newPlotNode, this.node.children.length - 1);
            newPlotNode.getComponent(LandPlot).init(newPlotData);
            this.landPlotPool.push(newPlotNode);
        
            this.node.removeChild(this.buyPlotNode);
            this.createBuyPlotButton();
            model.updateDataGame();
        } 
        else {
            view.showNotification('not enough Gold to buy Plot')
        }
    }

    public updateUI(plotId: number): void {
        const plotNode = this.landPlotPool.find(p => p.getComponent(LandPlot).data.id === plotId);
        if (plotNode) {
            plotNode.getComponent(LandPlot).updateUI();
        }
    }
}