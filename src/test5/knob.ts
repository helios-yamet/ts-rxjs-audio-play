import "./knob.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./knob.html";
import * as $ from "jquery";

const TEMPLATE_KNOB_ID: string = "##ID##";

export default class Knob extends Rx.BehaviorSubject<number> implements IDisposable {

    private subscription: Rx.Subscription;

    constructor(containerId: string, id: string, initialState: number) {
        super(initialState);

        let container: JQuery<HTMLElement> = $(`#${containerId}`);
        let renderedTemplate: string = template.replace(TEMPLATE_KNOB_ID, id);
        container.append(renderedTemplate);
        let knobElement: JQuery<HTMLElement> = $(`#${id}`);

        this.dragKnob(knobElement.get(0), this);

        this.subscription = this.subscribe(
            (state: number) => {
                let frame: number = Math.floor(state / 100 * 49);
                $(`#${id} .knob-sprites`).css("transform", `translate(${-frame * 100}px, 0px)`);
                $(`#${id} .knob-value h3`).text(state);
                console.log(`${id} state: ${state}`);
            },
            error => console.error(error),
            () => console.log("Completed")
        );
    }

    dispose(): void {
        this.subscription.unsubscribe();
    }

    /**
     * Simple drag for the button (new state value changes relative to current value).
     * @param connectBtn A button
     * @param knobSubject A subject where new values will be emitted
     */
    private dragKnob = function (this: Knob, htmlKnob: HTMLElement, knobSubject: Rx.BehaviorSubject<number>)
        : Rx.Subscription {

        const MAX_DIST: number = 100;

        let mouseDown$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(htmlKnob, "mousedown");
        let mouseMove$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(document, "mousemove");
        let mouseUp$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(document, "mouseup");
        let mouseDrag$: Rx.Observable<number> = mouseDown$.flatMap((downEvent: MouseEvent, index: number) => {

            downEvent.preventDefault();
            let startY: number = downEvent.screenY;
            let startValue: number = knobSubject.value;

            return mouseMove$.map((moveEvent) => {

                let dist: number = startY - moveEvent.screenY;
                let sign: number = dist < 0 ? -1 : 1;
                let normalized: number = Math.min(Math.abs(dist), MAX_DIST) * sign;
                return Math.round(Math.min(MAX_DIST, Math.max(0, startValue + normalized / MAX_DIST * 100)));
            })
                .distinctUntilChanged()
                .takeUntil(mouseUp$);
        });

        return mouseDrag$.subscribe(
            state => knobSubject.next(state),
            error => console.error(error));
    };
}