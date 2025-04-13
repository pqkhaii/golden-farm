export enum PlotStatus {
    Empty,
    Used,
    Harvested
}
  
export interface PlotData {
    id: number;
    status: PlotStatus;
    name: string;
    timeLeft: number;
}