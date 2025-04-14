import { ResourceType } from "../Data/GameConfig";

export enum PlotStatus {
    Empty,
    Used,
    Harvested
}
  
export interface PlotData {
    id: number;
    status: PlotStatus;
    name: string;
    type: string;
    timeLeft: number;
    startTime?: number;
    harvestedAmount?: number;
}