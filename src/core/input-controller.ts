import * as Rx from "rxjs/Rx";
import Knob from "../ui/knob";
import SoundUnit from "./sound-unit";

const MIDI_CONTROL_CHANGE: number = 176;
const MIDI_NOTE_ON_EVENT: number = 144;
const MIDI_NOTE_OFF_EVENT: number = 128;

const MIDI_MAPPING_FIRST_KNOB_ID: number = 21;
const MIDI_MAPPING_LAST_KNOB_ID: number = 28;

/**
 * Utility class to control an incoming signal from various places (MIDI controller and
 * key board as of today). Some fiddling with RXjs, mostly. Built for my own setup, might
 * need some tweaking to adapt to other controllers (knob ids are set for a LaunchKey Mini).
 */
export default class InputController implements IDisposable {

    private knobs: Knob[];
    private activeKnob: Knob | undefined;
    private activeKnobIndex: number | undefined;

    private subscriptions: Rx.Subscription[];
    private soundUnit: SoundUnit | undefined;

    constructor() {

        this.knobs = [];
        this.subscriptions = [];

        this.subscriptions.push(this.connectMidiController());
        this.subscriptions.push(this.numPadControl());
        this.subscriptions.push(this.arrowsSelectControl());
    }

    registerKnob = (knob: Knob) => {
        this.knobs.push(knob);
        if (!this.activeKnob) {
            this.selectKnob(knob);
        }
        knob.notifyMidiMapping(this.knobs.length + (MIDI_MAPPING_FIRST_KNOB_ID + 1));
        console.log(`registered knob ${knob.id}`);
    }

    setSoundUnit = (soundUnit: SoundUnit) => {
        this.soundUnit = soundUnit;
    }

    selectKnob = (knob: Knob) => {

        if (this.activeKnob) {
            this.activeKnob.markSelection(false);
        }

        this.activeKnob = knob;
        for (let i: number = 0; i < this.knobs.length; i++) {
            if (this.knobs[i].id === knob.id) {
                this.activeKnobIndex = i;
            }
        }

        knob.markSelection(true);
    }

    private selectKnobByIndex = (i: number) => {

        if (this.activeKnob) {
            this.activeKnob.markSelection(false);
        }

        this.activeKnobIndex = i;
        this.activeKnob = this.knobs[i];
        this.activeKnob.markSelection(true);
    }

    dispose(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    /**
     * Connect to a MIDI controller (just pick the first found)
     */
    private connectMidiController = function (this: InputController): Rx.Subscription {

        let midiInputs$: Rx.Observable<WebMidi.MIDIMessageEvent> = Rx.Observable.fromPromise(navigator.requestMIDIAccess())
            .flatMap((access: WebMidi.MIDIAccess) => {

                if (access.inputs.size === 0) {
                    throw "No MIDI input detected.";
                }

                let input: WebMidi.MIDIInput = access.inputs.values().next().value!;
                console.log(`Listening to input '${input.name}'...`);

                return Rx.Observable.fromEvent(input, "midimessage").map((event) => {
                    return event as WebMidi.MIDIMessageEvent;
                });
            })
            .distinctUntilChanged();

        return midiInputs$.subscribe(midiEvent => {

            let eventId: number = midiEvent.data[0];

            switch (eventId) {

                case MIDI_CONTROL_CHANGE:

                    let id: number = midiEvent.data[1];

                    // first knob on the controller is mapped to the selected UI knob
                    if (id === MIDI_MAPPING_FIRST_KNOB_ID) {
                        if (this.activeKnob) {
                            this.activeKnob.nextByRatio(midiEvent.data[2] / 127);
                        }
                        return;
                    }

                    // subsequent knobs are mapped to the UI knob by registration order
                    if (id > MIDI_MAPPING_FIRST_KNOB_ID &&
                        id <= MIDI_MAPPING_LAST_KNOB_ID) {

                        let knobId: number = midiEvent.data[1] - (MIDI_MAPPING_FIRST_KNOB_ID + 1);
                        if (knobId >= 0 && knobId < this.knobs.length) {
                            let knob: Knob = this.knobs[knobId];
                            knob.nextByRatio(midiEvent.data[2] / 127);
                        }
                    }
                    return;

                case MIDI_NOTE_ON_EVENT:

                    // handle notes on (simple handling, no scale or velocity)
                    if (this.soundUnit) {
                        this.soundUnit.noteOn();
                    }
                    return;

                case MIDI_NOTE_OFF_EVENT:

                    // handle notes off
                    if (this.soundUnit) {
                        this.soundUnit.noteOff();
                    }
                    return;
            }
        },
            error => console.error(error)
        );
    };

    /**
     * Control input from keyboard (will produce a value shortly after no additional number has been typed)
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
            .filter((digits) => digits.length > 0)
            .map((digits: number[]) => {
                let value: number = 0;
                digits.reverse().forEach((digit: number, index: number) => {
                    value += Math.pow(10, index) * digit;
                });
                return value;
            });

        return stream$.subscribe(
            state => {
                if (this.activeKnob) {
                    let normalizedValue: number = Math.min(this.activeKnob.maxValue, Math.max(this.activeKnob.minValue, state));
                    this.activeKnob.next(normalizedValue);
                }
            },
            error => console.error(error));
    };

    /**
     * Control input from keyboard (will select next or previous knob based on registered order)
     */
    private arrowsSelectControl = function (this: InputController): Rx.Subscription {

        const KEY_LEFT: number = 37;
        const KEY_RIGHT: number = 39;

        // modulo function which works for negative (js has a funny modulo function)
        const arrayIndex: (i: number, length: number) => number = (x, n) => (x % n + n) % n;

        return Rx.Observable.fromEvent<KeyboardEvent>(document, "keydown")
            .map((event) => {
                switch (event.keyCode) {
                    case KEY_LEFT: return -1;
                    case KEY_RIGHT: return 1;
                    default: return 0;
                }
            })
            .filter(x => x !== 0)
            .subscribe(
                x => {
                    let test: number = this.activeKnobIndex ? this.activeKnobIndex + x : 0;
                    this.selectKnobByIndex(arrayIndex(test, this.knobs.length));
                },
                error => console.error(error));
    };
}