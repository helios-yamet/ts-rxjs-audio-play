import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

export default class Test4 implements IDisposable {

    private subscription: Rx.Subscription | undefined;

    constructor() {

        $("#content").html(template);

        let knob: Rx.BehaviorSubject<number> = new Rx.BehaviorSubject(0);

        this.connectMidiController($("#connect").get(0), knob);
        this.dragKnob($("#knob-animation-wrapper").get(0), knob);
        this.numPadControl(knob);

        knob.subscribe(
            (state: number) => {
                let frame: number = Math.round(state / 100 * 50);
                $("#knob-sprites").css("transform", `translate(${-frame * 200}px, 0px)`);
                $("#knob-value h3").text(state);
                console.log(`Subject state: ${state}`);
            },
            error => console.error(error),
            () => console.log("Completed")
        );
    }

    dispose(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * Connect to a MIDI input (just pick the first found)
     * @param connectBtn A button
     * @param knobSubject A subject where new values will be emitted
     */
    private connectMidiController = function (this: Test4, connectBtn: HTMLElement, knobSubject: Rx.BehaviorSubject<number>)
        : Rx.Subscription {

        let midiInputs$: Rx.Observable<number> = Rx.Observable.fromEvent(connectBtn, "click")
            .take(1)
            .flatMapTo(Rx.Observable.fromPromise(navigator.requestMIDIAccess()))
            .flatMap((access: WebMidi.MIDIAccess, index: number) => {
                if (access.inputs.size === 0) {
                    throw "No MIDI input detected.";
                }
                let input: WebMidi.MIDIInput = access.inputs.values().next().value!;
                let subject: Rx.Subject<number> = new Rx.Subject();
                input.addEventListener("midimessage", (event: Event) => {
                    let midiEvent: WebMidi.MIDIMessageEvent = event as WebMidi.MIDIMessageEvent;
                    subject.next(Math.round(midiEvent.data[2] / 127 * 100));
                });
                console.log(`Listening to input '${input.name}'...`);
                return subject;
            })
            .distinctUntilChanged();

        return midiInputs$.subscribe(
            state => knobSubject.next(state),
            error => console.error(error)
        );
    };

    /**
     * Simple drag for the button (new state value changes relative to current value).
     * @param connectBtn A button
     * @param knobSubject A subject where new values will be emitted
     */
    private dragKnob = function (this: Test4, htmlKnob: HTMLElement, knobSubject: Rx.BehaviorSubject<number>)
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

    /**
     * Control input from keyboard (will produce a value shortly after no additional number has been typed)
     * @param knobSubject A subject where new values will be emitted
     */
    private numPadControl = function (this: Test4, knobSubject: Rx.BehaviorSubject<number>)
        : Rx.Subscription {

        const KEY0: number = 48;
        const KEY9: number = 57;
        const KEYNUM0: number = 96;
        const KEYNUM9: number = 105;

        let input$: Rx.Observable<KeyboardEvent> = Rx.Observable.fromEvent<KeyboardEvent>(document, "keydown");
        let debounceBreak$: Rx.Observable<KeyboardEvent> = input$.debounceTime(350);
        let stream$: Rx.Observable<number> = input$
            .map((event) => {
                let code: number = event.keyCode;
                if (code >= KEYNUM0 && code <= KEYNUM9) {
                    return code - KEYNUM0;
                } else if (code >= KEY0 && code <= KEY9) {
                    return code - KEY0;
                }
                return -1;
            })
            .filter((digit) => digit >= 0)
            .buffer(debounceBreak$)
            .map((digits: number[], y: number) => {
                let value: number = 0;
                digits.reverse().forEach((digit: number, index: number) => {
                    value += Math.pow(10, index) * digit;
                });
                console.log(`Value input: ${value}`);
                return Math.min(value, 100);
            });

        return stream$.subscribe(
            state => knobSubject.next(state),
            error => console.error(error));
    };
}