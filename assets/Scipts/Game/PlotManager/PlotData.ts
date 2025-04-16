export enum PlotStatus {
    Empty,
    Used,
    ReadyToHarvest
}
  
export interface PlotData {
    id: number;
    status: PlotStatus;
    name: string;
    type: string;
    timeLeft: number;
    harvestedAmount?: number;
    yieldPerCycle: number,
    maxYield: number,
}