import { _decorator, Component, instantiate, Node, Prefab, UITransform, Vec3 } from 'cc';
import { PlotData, PlotStatus } from './PlotData';
import { LandPlot } from './LandPlot';
const { ccclass, property } = _decorator;

@ccclass('PlotMapManager')
export class PlotMapManager extends Component {
    
    @property({type: Prefab})
    private landPlotPrefab: Prefab;

    @property({type: UITransform})
    private uiTransform: UITransform;
  
    private plotWidth = 240;
    private plotHeight = 240;
    private spacing = 10;
  
    protected start() {
      this.initPlots();
    }
  
    private initPlots() {
        const mapWidth = this.uiTransform.contentSize.x;
        const mapHeight = this.uiTransform.contentSize.y;
      
        const cols = Math.floor((mapWidth + this.spacing) / (this.plotWidth + this.spacing));
        const rows = Math.floor((mapHeight + this.spacing) / (this.plotHeight + this.spacing));
        const totalPlots = cols * rows;
      
        // 👇 Set lại contentSize cho scrollview
        const contentWidth = cols * (this.plotWidth + this.spacing) - this.spacing;
        const contentHeight = rows * (this.plotHeight + this.spacing) - this.spacing;
        this.uiTransform.setContentSize(contentWidth, contentHeight);
      
        for (let i = 0; i < totalPlots; i++) {
          const plotNode = instantiate(this.landPlotPrefab);
      
          const row = Math.floor(i / cols);
          const col = i % cols;
      
          const x = col * (this.plotWidth + this.spacing);
          const y = -row * (this.plotHeight + this.spacing);
      
          plotNode.setPosition(new Vec3(x, y, 0));
          this.node.addChild(plotNode);
      
          const data: PlotData = {
            id: i,
            isBought: i < 3,
            status: i < 3 ? PlotStatus.Empty : PlotStatus.Locked,
            name: "",
            timeLeft: 0
          };
      
          plotNode.getComponent(LandPlot).init(data);
        }
    }
}


