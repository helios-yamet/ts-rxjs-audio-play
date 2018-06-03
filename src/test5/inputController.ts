import * as $ from "jquery";
import * as Rx from "rxjs/Rx";
import Knob from "./knob";

export default class InputController implements IDisposable {

    private knobs: Knob[];
    private activeKnob: Knob | undefined;

    private subscriptions: Rx.Subscription[];

    constructor() {

        this.knobs = [];
        this.subscriptions = [];

        this.subscriptions.push(this.connectMidiController($("#connect").get(0)));
        this.subscriptions.push(this.numPadControl());
    }

    registerKnob = (knob: Knob) => {
        this.knobs.push(knob);
    }

    selectKnob = (knob: Knob) => {
        if(this.activeKnob) {
            this.activeKnob.markSelection(false);
        }
        this.activeKnob = knob;
        knob.markSelection(true);
    }

    dispose(): void {
        this.subscriptions.forEach(s => {
            s.unsubscribe();
        });
    }

    /**
     * Connect to a MIDI input (just pick the first found)
     * @param connectBtn A button
     * @param knobSubject A subject where new values will be emitted
     */
    private connectMidiController = function (this: InputController, connectBtn: HTMLElement)
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
                    subject.next(Math.round(midiEvent.data[2]));
                });
                console.log(`Listening to input '${input.name}'...`);
                return subject;
            })
            .distinctUntilChanged();

        return midiInputs$.subscribe(
            value => {
                if(this.activeKnob) {
                    let ratio: number = value / 127;
                    let normalizedValue: number = Math.round(
                        this.activeKnob.minValue + ratio * (this.activeKnob.maxValue - this.activeKnob.minValue));
                    this.activeKnob.next(normalizedValue);
                }
            },
            error => console.error(error)
        );
    };

    /**
     * Control input from keyboard (will produce a value shortly after no additional number has been typed)
     * @param knobSubject A subject where new values will be emitted
     */
    private numPadControl = function (this: InputController): Rx.Subscription {

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
                return value;
            });

        return stream$.subscribe(
            state => {
                if(this.activeKnob) {
                    let normalizedValue: number = Math.min(this.activeKnob.maxValue, Math.max(this.activeKnob.minValue, state));
                    this.activeKnob.next(normalizedValue);
                }
            },
            error => console.error(error));
    };
}