import * as Rx from "rxjs/Rx";
import SoundUnit from "./sound-unit";

const MIDI_CONTROL_CHANGE: number = 176;
const MIDI_NOTE_ON_EVENT: number = 144;
const MIDI_NOTE_OFF_EVENT: number = 128;

export default class MidiController implements IDisposable {

    private soundUnit: SoundUnit;
    private controls: ISynthControl[];

    private inputs: Map<string, WebMidi.MIDIPort> | undefined;
    private midiConnection: Rx.Subscription | undefined;

    constructor(soundUnit: SoundUnit, controls: ISynthControl[]) {
        this.soundUnit = soundUnit;
        this.controls = controls;
    }

    /**
     * Request list of active MIDI interfaces
     */
    public async getMidiInterfaces(): Promise<Map<string, WebMidi.MIDIPort>> {

        const midiAccess: WebMidi.MIDIAccess = await window.navigator.requestMIDIAccess();
        this.inputs = midiAccess.inputs;
        return this.inputs;
    }

    /**
     * Connect to a MIDI interface
     */
    public connectMidiInterface(id: string): void {

        const input: any = this.inputs && this.inputs.get(id);
        if (!input) {
            return;
        }

        this.midiConnection = Rx.Observable.fromEvent(input, "midimessage")
            .map((event) => event as WebMidi.MIDIMessageEvent)
            .distinctUntilChanged()
            .subscribe((midiEvent) => {
                switch (midiEvent.data[0]) {
                    case MIDI_CONTROL_CHANGE:
                        this.handleControlChange(midiEvent.data[1], midiEvent.data[2]);
                        return;
                    case MIDI_NOTE_ON_EVENT:
                        this.soundUnit.noteOn();
                        console.log(`MIDI Note ON ! -> ${midiEvent.data[1]} / ${midiEvent.data[2]}`);
                        return;
                    case MIDI_NOTE_OFF_EVENT:
                        this.soundUnit.noteOff();
                        return;
                }
            }, (error) => console.error(error));
    }

    private handleControlChange(id: number, data: number): void {
        // console.log(`Control change (id: ${id}, data: ${data})`);
        this.controls[id - 21].setValueByRatio(data / 127); // for debug
    }

    dispose(): void {
        if (this.midiConnection) {
            this.midiConnection.unsubscribe();
        }
    }
}
