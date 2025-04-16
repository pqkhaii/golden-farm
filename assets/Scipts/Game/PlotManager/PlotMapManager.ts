import { _decorator, Component, instantiate, Node, Prefab, Settings, UITransform, Vec3 } from 'cc';
import { PlotData, PlotStatus } from './PlotData';
import { LandPlot } from './LandPlot';
import { GameModel } from '../GameModel';
import { GameView } from '../GameView';
import { plotConfig, ProduceConfigs, ResourceType, ShopItemID } from '../Data/GameConfig';
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

    private timeCounter: number = 0;

    private gameView: GameView;
    private gameModel: GameModel;

    protected onLoad(): void {
        PlotMapManager.Instance = this;
    }

    protected start() {
        this.gameView = GameView.Instance;
        this.gameModel = GameModel.Instance;

        this.initPlots();
    }

    protected update(dt: number): void {
        this.timeCounter += dt;
        if (this.timeCounter >= 1) {
            this.timeCounter = 0;
            this.updateCountdown();
        }
    }

    private updateCountdown(): void {
        let hasUpdate = false;
    
        for (const plotNode of this.landPlotPool) {
            const plot = plotNode.getComponent(LandPlot);
            const data = plot.data;
    
            if (data.status === PlotStatus.Used && data.timeLeft > 0) {
                data.timeLeft -= 1;
                if (data.timeLeft <= 0) {
                    data.timeLeft = 0;
                    data.status = PlotStatus.ReadyToHarvest;
                }
                plot.updateUI();
                hasUpdate = true;
            }
        }
    
        if (hasUpdate) {
            this.gameModel.updateDataGame();
        }
    }
    

    private initPlots() {
        const plotDataList = this.gameModel.plots;
        for (const data of plotDataList) {
            const plotNode = instantiate(this.landPlotPrefab);
            this.landPlotPool.push(plotNode);
            this.node.addChild(plotNode);

            let plotComponent = plotNode.getComponent(LandPlot);
            plotComponent.init(data);

            //add event click plot
            this.addEventClickPlot(plotComponent, plotNode);
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
        const spendGold = this.gameModel.spendGold(plotConfig.price);
        if(spendGold){
            this.gameView.updateUI();

            const id = this.gameModel.plots.length;
            const newPlotData = {
                id,
                isBought: true,
                status: PlotStatus.Empty,
                type: null,
                name: "",
                timeLeft: 0,
                yieldPerCycle: 0,
                maxYield: 0
            };
            this.gameModel.plots.push(newPlotData);
        
            const newPlotNode = instantiate(this.landPlotPrefab);
            this.node.insertChild(newPlotNode, this.node.children.length - 1);
            newPlotNode.getComponent(LandPlot).init(newPlotData);
            this.landPlotPool.push(newPlotNode);
        
            this.node.removeChild(this.buyPlotNode);
            this.createBuyPlotButton();
            this.gameModel.updateDataGame();

            let plotComponent = newPlotNode.getComponent(LandPlot);

            this.addEventClickPlot(plotComponent, newPlotNode);

            this.gameView.showNotification('Buy new plot successfully')
        } 
        else {
            this.gameView.showNotification('Not enough Gold to buy Plot')
        }
    }

    private addEventClickPlot(plotComponent: LandPlot, plotNode: Node): void {
        plotNode.off(Node.EventType.TOUCH_END);
        plotNode.on(Node.EventType.TOUCH_END, () => {
            const plotData = plotComponent.data;

            if (plotData.status === PlotStatus.Empty) {
                this.plantOptions.showAtPosition(plotNode, plotData);
                return;
            }

            if (plotData.status === PlotStatus.Used) {
                this.gameView.showNotification("This plot harvested or raised");
            }

            if (plotData.status === PlotStatus.ReadyToHarvest) {
                this.gameModel.harvestPlot(plotComponent.data.id);
                this.updateUI(plotData.id);
            }
        });
    }

    public updateUI(plotId: number): void {
        const plotNode = this.landPlotPool.find(p => p.getComponent(LandPlot).data.id === plotId);
        
        if(!plotNode) return;

        const plotComponent = plotNode.getComponent(LandPlot);
        plotComponent.updateUI();
        this.addEventClickPlot(plotComponent, plotNode);
    }
}