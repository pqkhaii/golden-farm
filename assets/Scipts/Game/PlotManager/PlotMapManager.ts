import { _decorator, Component, instantiate, Node, Prefab, Settings, UITransform, Vec3 } from 'cc';
import { PlotData, PlotStatus } from './PlotData';
import { LandPlot } from './LandPlot';
import { GameModel } from '../GameModel';
import { InitialState, ShopConfig } from '../Data/GameConfig';
import { GameController } from '../GameController';
import { GameView } from '../GameView';
const { ccclass, property } = _decorator;

@ccclass('PlotMapManager')
export class PlotMapManager extends Component {
    
    @property({type: Prefab})
    private landPlotPrefab: Prefab;

    @property({type: Prefab})
    private buyPlotPrefab: Prefab;

    private landPlotPool: Node[] = [];

    private buyPlotNode: Node = null;

    protected start() {
        this.initPlots();
    }

    private initPlots() {
        const plotDataList = GameModel.Instance.plots;
        for (const data of plotDataList) {
            const plotNode = instantiate(this.landPlotPrefab);
            this.landPlotPool.push(plotNode);
            this.node.addChild(plotNode);
            plotNode.getComponent(LandPlot).init(data);
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
        if (GameModel.Instance.Gold >= ShopConfig.plot) {
            GameModel.Instance.spendGold(ShopConfig.plot);
            GameView.Instance.updateUI();

            const id = GameModel.Instance.plots.length;
            const newPlotData = {
                id,
                isBought: true,
                status: PlotStatus.Empty,
                name: "",
                timeLeft: 0
            };
            GameModel.Instance.plots.push(newPlotData);
        
            const newPlotNode = instantiate(this.landPlotPrefab);
            this.node.insertChild(newPlotNode, this.node.children.length - 1); // Insert trước buyPlotNode
            newPlotNode.getComponent(LandPlot).init(newPlotData);
            this.landPlotPool.push(newPlotNode);
        
            this.node.removeChild(this.buyPlotNode);
            this.createBuyPlotButton();
        } 
        else {
            console.log("Không đủ vàng để mua đất");
        }
    }
}