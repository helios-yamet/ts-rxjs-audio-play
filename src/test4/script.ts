import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

export default class Test4 implements IDisposable {

    private subscription: Rx.Subscription | undefined;

    constructor() {

        $("#content").html(template);

        this.connectMidiController($("#connect").get(0));
        this.dragKnob($("#knob-animation-wrapper").get(0));
    }

    dispose(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * Connect to a MIDI input (just pick the first found)
     * @param connectBtn A button
     */
    private connectMidiController = function (this: Test4, connectBtn: HTMLElement): void {

        this.subscription = Rx.Observable.fromEvent(connectBtn, "click")
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
            .subscribe(
                (state: number) => {
                    let frame: number = Math.round(state / 100 * 50);
                    $("#knob-sprites").css("transform", `translate(${-frame*200}px, 0px)`);
                    $("#knob-value h3").text(state);
                    console.log(state);
                },
                error => console.error(error)
            );
    };

    /**
     * Simple drag for the button (works in absolute mode, not taking the current value into account).
     * @param connectBtn A button
     */
    private dragKnob = function (this: Test4, knob: HTMLElement): void {

        let mouseDown$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(knob, "mousedown");
        let mouseMove$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(document, "mousemove");
        let mouseUp$: Rx.Observable<MouseEvent> = Rx.Observable.fromEvent(document, "mouseup");

        let mouseDrag$: Rx.Observable<number> = mouseDown$.flatMap((downEvent: MouseEvent, index: number) => {

            downEvent.preventDefault();
            const MAX_DIST: number = 100;

            // calculate offsets when mouse down
            let startY: number = downEvent.screenY;

            return mouseMove$.map((moveEvent) => {

                let newY: number = moveEvent.screenY;
                let dist: number = startY - newY;
                return Math.round(Math.max(Math.min(dist, MAX_DIST) / MAX_DIST * 100, 0));

            }).takeUntil(mouseUp$);
        });

        this.subscription = mouseDrag$.subscribe((state: number) => {
            let frame: number = Math.round(state / 100 * 50);
            $("#knob-sprites").css("transform", `translate(${-frame*200}px, 0px)`);
            $("#knob-value h3").text(state);
            console.log(state);
            });
    };
}