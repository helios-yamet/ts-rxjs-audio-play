import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./test1.html";

export default class Test1 {

    constructor() {

        let content: string = document.getElementById("content")!.innerHTML = template;
        let test1Content: HTMLElement = document.getElementById("test1-content")!;

        let state: Rx.Observable<number> = Rx.Observable.fromEvent<MouseEvent>(test1Content, "mousemove")
            .throttleTime<MouseEvent>(50)
            .pairwise<MouseEvent>()
            .map<MouseEvent[], number>((pair) => {
                return this.mouseSpeed(pair[0], pair[1]);
            })
            .bufferTime<number>(100)
            .map<number[], number>((buffer) => {
                return buffer.length > 0
                    ? buffer.reduce((prev, current) => prev + current, 0) / buffer.length
                    : 0;
            });

        state.subscribe((state) => {
            console.log(state);
        });
    }

    /**
     * Calculate the speed of cursor based on two subsequent mouse events
     * @param previous previous mouse event
     * @param current  current mouse event
     */
    private mouseSpeed = function(previous: MouseEvent, current: MouseEvent): number {

        let distance: number = Math.sqrt(
            Math.pow(previous.pageX-current.pageX, 2) +
            Math.pow(previous.pageY-current.pageY, 2));

        return distance / (current.timeStamp - previous.timeStamp);
    };
}