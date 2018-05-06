import "./knob.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./knob.html";
import * as $ from "jquery";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class Knob extends Rx.BehaviorSubject<number> implements IDisposable {

    private id: string;
    private label: string;

    private subscriptions: Rx.Subscription[];

    constructor(containerId: string, id: string, label: string, initialState: number) {
        super(initialState);

        this.id = id;
        this.label = label;
        this.subscriptions = [];

        // render knob
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        this.subscriptions.push(this.setupDrag());
        this.subscriptions.push(this.setupUIUpdate());
    }

    dispose(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    /**
     * Simple drag behavior for the knob (new value changes relative to current value).
     */
    private setupDrag = function (this: Knob): Rx.Subscription {

        const MAX_DIST: number = 100;

        let knobElement: HTMLElement = $(`#${this.id}`).get(0);
        let mouseDown$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(knobElement, "mousedown");
        let mouseMove$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(document, "mousemove");
        let mouseUp$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(document, "mouseup");
        let mouseDrag$: Rx.Observable<number> = mouseDown$.flatMap((downEvent: MouseEvent, index: number) => {

            downEvent.preventDefault();
            let startY: number = downEvent.screenY;
            let startValue: number = this.value;

            return mouseMove$
                .map((moveEvent) => {

                    let dist: number = startY - moveEvent.screenY;
                    let sign: number = dist < 0 ? -1 : 1;
                    let normalized: number = Math.min(Math.abs(dist), MAX_DIST) * sign;
                    return Math.round(Math.min(MAX_DIST, Math.max(0, startValue + normalized / MAX_DIST * 100)));
                })
                .distinctUntilChanged()
                .takeUntil(mouseUp$);
        });

        return mouseDrag$.subscribe(
            state => this.next(state),
            error => console.error(error));
    };

    /**
     * Update the UI to reflect the subject value change.
     */
    private setupUIUpdate = function (this: Knob): Rx.Subscription {

        return this.subscribe(
            (state: number) => {
                let frame: number = Math.floor(state / 100 * 49);
                $(`#${this.id} .knob-animation-sprites`).css("transform", `translate(${-frame * 100}px, 0px)`);
                $(`#${this.id} .knob-value`).text(state);
                console.log(`${this.id} state: ${state}`);
            },
            error => console.error(error),
            () => console.log("Completed")
        );
    };
}