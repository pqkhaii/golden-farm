export enum PlotStatus {
    Locked,
    Empty,
    Used
}
  
export interface PlotData {
    id: number;
    status: PlotStatus;
    name: string;
    timeLeft: number;
    isBought: boolean;
}