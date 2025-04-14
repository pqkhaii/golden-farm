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

    protected onLoad(): void {
        PlotMapManager.Instance = this;
    }

    protected start() {
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
                    data.status = PlotStatus.Harvested;
                }
                plot.updateUI();
                hasUpdate = true;
            }
        }
    
        if (hasUpdate) {
            GameModel.Instance.updateDataGame();
        }
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
                plotNode.on(Node.EventType.TOUCH_END, () => {
                    const plotData = plotComponent.data;
                    
                    if (plotData.status === PlotStatus.Empty) {
                        this.plantOptions.showAtPosition(plotNode, plotData);
                        return;
                    }
                
                    if (plotData.status === PlotStatus.Used) {
                        const cfg = ProduceConfigs[plotData.name as ResourceType];
                        const now = Date.now() / 1000;
                        const startTime = plotData.startTime ?? now;
                        const elapsed = now - startTime;
                
                        const cyclesPassed = Math.floor(elapsed / cfg.growTime);
                        const harvestedAmount = plotData.harvestedAmount ?? 0;
                        const newHarvest = Math.min(cfg.maxYield - harvestedAmount, cyclesPassed);
                        
                        const totalLifetime = cfg.growTime * cfg.maxYield;
                        const expired = elapsed > totalLifetime + cfg.harvestWindow;
                
                        if (expired) {
                            plotData.status = PlotStatus.Empty;
                            plotData.name = "";
                            plotData.startTime = 0;
                            plotData.harvestedAmount = 0;
                            plotData.timeLeft = 0;
                            GameModel.Instance.updateDataGame();
                            GameView.Instance.showNotification("Your crop has died!");
                            this.updateUI(plotData.id);
                            return;
                        }
                
                        if (newHarvest > 0) {
                            GameModel.Instance.addHarvested(plotData.name as ResourceType, newHarvest);
                            plotData.harvestedAmount = harvestedAmount + newHarvest;
                            plotData.timeLeft = (cyclesPassed + 1) * cfg.growTime - elapsed;
                
                            if (plotData.harvestedAmount >= cfg.maxYield) {
                                plotData.status = PlotStatus.Harvested;
                            }
                
                            GameModel.Instance.updateDataGame();
                            GameView.Instance.updateUI();
                            GameView.Instance.showNotification(`Harvested ${newHarvest} ${cfg.name}!`);
                            this.updateUI(plotData.id);
                        } else {
                            GameView.Instance.showNotification("Nothing to harvest yet!");
                        }
                    }
                });
                
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
                type: null,
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

            let plotComponent = newPlotNode.getComponent(LandPlot);

            newPlotNode.on(Node.EventType.TOUCH_END, () => {
                const plotData = plotComponent.data;
                if (plotData.status === PlotStatus.Empty) {
                    this.plantOptions.showAtPosition(newPlotNode, plotData);
                } else if (plotData.status === PlotStatus.Harvested) {
                    GameModel.Instance.harvestPlot(plotData.id);
                }
            });

            view.showNotification('Buy new plot successfully')
        } 
        else {
            view.showNotification('Not enough Gold to buy Plot')
        }
    }

    public updateUI(plotId: number): void {
        const plotNode = this.landPlotPool.find(p => p.getComponent(LandPlot).data.id === plotId);
        if (plotNode) {
            plotNode.getComponent(LandPlot).updateUI();
        }
    }
}