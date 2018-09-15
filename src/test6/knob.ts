import "./knob.css";

import * as template from "!raw-loader!./knob.html";
import * as $ from "jquery";
import * as Rx from "rxjs/Rx";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class Knob extends Rx.BehaviorSubject<number> implements IDisposable {

    public id: string;
    public minValue: number;
    public maxValue: number;

    private label: string;
    private subscriptions: Rx.Subscription[];
    private displayValue: (value: number) => string;

    private $knobLabel: JQuery<HTMLElement>;
    private $knobDragArea: JQuery<HTMLElement>;
    private $knobSprites: JQuery<HTMLElement>;
    private $knobValue: JQuery<HTMLElement>;

    constructor(
        containerId: string,
        id: string,
        label: string,
        minValue: number,
        maxValue: number,
        initialValue: number,
        displayValue: (value: number) => string,
        selectionCallback: (knob: Knob) => void) {

        super(initialValue);

        this.id = id;
        this.label = label;
        this.subscriptions = [];
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.displayValue = displayValue;

        // render knob
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        // resolve jQuery elements
        this.$knobLabel = $(`#${this.id} .knob-label`);
        this.$knobDragArea = $(`#${this.id} .knob-drag-area`);
        this.$knobSprites = $(`#${this.id} .knob-sprites`);
        this.$knobValue = $(`#${this.id} .knob-value`);

        this.subscriptions.push(this.setupDrag());
        this.subscriptions.push(this.setupUIUpdate());
        this.subscriptions.push(this.setupSelector(selectionCallback));
    }

    dispose(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    /**
     * Simple drag behavior for the knob (new value changes relative to current value).
     */
    private setupDrag = function (this: Knob): Rx.Subscription {

        const MAX_DRAG_DIST: number = 100;

        let mouseDown$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(this.$knobDragArea.get(0), "mousedown");
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
                    let normalizedDist: number = Math.min(Math.abs(dist), MAX_DRAG_DIST) * sign;
                    let distRatio: number = normalizedDist / MAX_DRAG_DIST;
                    let newValue: number = startValue + distRatio * (this.maxValue - this.minValue);
                    return Math.round(Math.min(this.maxValue, Math.max(this.minValue, newValue)));
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

        const NB_FRAMES: number = 50;
        const SPRITE_WIDTH: number = 100;

        return this.subscribe(
            (state: number) => {
                let ratio: number = (state - this.minValue) / (this.maxValue - this.minValue);
                let frame: number = Math.floor(ratio * (NB_FRAMES-1));
                this.$knobSprites.css("transform", `translate(${-frame * SPRITE_WIDTH}px, 0px)`);
                this.$knobValue.text(this.displayValue(state));
            },
            error => console.error(error),
            () => console.log("Completed")
        );
    };

    /**
     * Setup the selection behaviour by click (report selection to caller)
     */
    private setupSelector = function (this: Knob, selectionCallback: (knob: Knob) => void): Rx.Subscription {

        return Rx.Observable.fromEvent(this.$knobLabel.get(0), "click").subscribe(() => {
            selectionCallback(this);
        });
    };

    /**
     * Mark as selected (or unselected)
     * @param selected Selected or not
     */
    public markSelection = function (this: Knob, selected: boolean): void {

        if(selected) {
            this.$knobLabel.addClass("selected");
        } else {
            this.$knobLabel.removeClass("selected");
        }
    };
}