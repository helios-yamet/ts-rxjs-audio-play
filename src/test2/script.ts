import "./styles.css";
import "./knob.png";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

export default class Test2 implements IDisposable {

    private subscription: Rx.Subscription | undefined;

    constructor() {

        $("#content").html(template);

        let connectBtn: JQuery<HTMLElement> = $("#connect");
        Rx.Observable.fromEvent(connectBtn.get(0), "click")
            .subscribe(() => this.connectMidi(connectBtn.get(0)));
    }

    dispose(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * Connect to a MIDI input
     * @param connectBtn A button
     */
    private connectMidi = function (this: Test2, connectBtn: HTMLElement): void {

        let access: WebMidi.MIDIAccess;
        Rx.Observable
            .fromPromise(navigator.requestMIDIAccess())
            .subscribe(
                (next) => {
                    if (next.inputs.size > 0) {
                        let input: WebMidi.MIDIInput = next.inputs.values().next().value!;
                        let knob$: Rx.Observable<number> = this.createObservable(input);
                        this.subscription = knob$.subscribe((state) => {

                            let angle: number = state / 100 * 360;
                            $("#knob").css("-webkit-transform", `rotate(${angle}deg)`);
                            $("#knob").css("transform", `rotate(${angle}deg)`);

                            $("#knob-value h3").text(state);
                        });
                        console.log(`Connected to input '${input.name}'`);
                    } else {
                        console.error("No MIDI input detected.");
                    }
                },
                (error) => {
                    console.error(`Cannot connect Web MIDI: ${error}`);
                }
            );
    };

    /**
     * Observable for the values received from the given midi input.
     * @param midiInput A MIDI input
     */
    private createObservable = function (this: Test2, midiInput: WebMidi.MIDIInput): Rx.Observable<number> {

        let subject: Rx.Subject<number> = new Rx.Subject();
        midiInput.onmidimessage = function (e: WebMidi.MIDIMessageEvent): void {
            console.log(e.data);
            let val: number = e.data[2];
            subject.next(Math.round(val / 127 * 100));
        };
        return subject;
    };
}