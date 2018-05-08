import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import Knob from "./knob";

export default class Test5 implements IDisposable {

    private knobs: Knob[];
    private activeKnob: Knob | undefined;

    constructor() {

        $("#content").html(template);

        this.knobs = [];
        for(let i:number = 0; i<15; i++) {
            let initValue: number = Math.round(Math.random() * 100);
            this.knobs.push(new Knob("knobs-container", `knob${i}`, `Knob ${i}`, initValue, this.selectKnob));
        }

        this.connectMidiController($("#connect").get(0));
        this.numPadControl();
    }

    dispose(): void {
        this.knobs.forEach(knob => {
            knob.dispose();
        });
    }

    selectKnob = (knob: Knob) => {
        if(this.activeKnob) {
            this.activeKnob.markSelection(false);
        }
        this.activeKnob = knob;
        knob.markSelection(true);
    }

    /**
     * Connect to a MIDI input (just pick the first found)
     * @param connectBtn A button
     * @param knobSubject A subject where new values will be emitted
     */
    private connectMidiController = function (this: Test5, connectBtn: HTMLElement)
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
            state => {
                if(this.activeKnob) {
                    this.activeKnob.next(state);
                }
            },
            error => console.error(error)
        );
    };

    /**
     * Control input from keyboard (will produce a value shortly after no additional number has been typed)
     * @param knobSubject A subject where new values will be emitted
     */
    private numPadControl = function (this: Test5): Rx.Subscription {

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
                return Math.min(value, 100);
            });

        return stream$.subscribe(
            state => {
                if(this.activeKnob) {
                    this.activeKnob.next(state);
                }
            },
            error => console.error(error));
    };
}