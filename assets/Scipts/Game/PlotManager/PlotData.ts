export enum PlotStatus {
    Empty,
    Used
}
  
export interface PlotData {
    id: number;
    status: PlotStatus;
    name: string;
    timeLeft: number;
}