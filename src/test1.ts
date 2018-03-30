import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./test1.html";
import * as $ from "jquery";

interface IEvent {
    timeStamp: number;
    pageX: number;
    pageY: number;
}

const MAX_SPEED: number = 2;
const SMOOTHING: number = 0.939;

export default class Test1 {

    constructor() {

        let content: string = document.getElementById("content")!.innerHTML = template;
        let test1Content: HTMLElement = document.getElementById("test1-content")!;

        let mouseSpeed$: Rx.Observable<number> = this.createObservable(test1Content);
        let subscription: Rx.Subscription = mouseSpeed$.subscribe((state) => {
            console.log(state);
            $("#progress-speed > div").attr("style", "width: "+state+"%");
        });
    }

    /**
     * Create an observable emitting the speed of the mouse over the provided
     * HTML element.
     */
    private createObservable = function(this: Test1, test1Content: HTMLElement): Rx.Observable<number> {

        let mouseEvents$: Rx.Observable<MouseEvent> = Rx.Observable
            .fromEvent<MouseEvent>(test1Content, "mousemove");

        let timer$: Rx.Observable<number> = Rx.Observable
            .interval(0)
            .map(() => Rx.Scheduler.animationFrame.now())
            .withLatestFrom(mouseEvents$)
            .map<[number, MouseEvent], IEvent>((combo) => {
                return {
                    timeStamp: combo[0],
                    pageX: combo[1].pageX,
                    pageY: combo[1].pageY
                };
            })
            .pairwise<IEvent>()
            .map<IEvent[], number>((pair) => this.mouseSpeed(pair[0], pair[1]))
            .scan<number>((prev, current) => SMOOTHING * prev + (1-SMOOTHING) * current, 0)
            .map<number, number>((speed) => this.normalizeSpeed(speed, MAX_SPEED));

        return timer$;
    };

    /**
     * Calculate the speed of cursor based on two subsequent mouse events
     * @param previous previous mouse event
     * @param current  current mouse event
     */
    private mouseSpeed = function(previous: IEvent, current: IEvent): number {

        let distance: number = Math.sqrt(
            Math.pow(previous.pageX-current.pageX, 2) +
            Math.pow(previous.pageY-current.pageY, 2));

        let time: number = current.timeStamp - previous.timeStamp;
        return time > 0 ? distance / time : 0;
    };

    /**
     * Normalize provided speed to a percentage of the given max speed
     * @param speed A mouse speed
     * @param maxSpeed The max speed threshold (corresponds to 100)
     */
    private normalizeSpeed = function(speed: number, maxSpeed: number): number {
        return Math.floor(Math.min(speed, maxSpeed) / maxSpeed * 100);
    };
}