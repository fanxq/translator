export enum VisibleType {
    NONE,
    SHOW_TRANSLATOR_PANEL,
    SHOWM_SCREEN_CAPTURE_COMP,
};

export class Point {
    public x:number;
    public y:number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}