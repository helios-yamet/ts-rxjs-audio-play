import * as Rx from "rxjs/Rx";
import SoundUnit from "./sound-unit";

const MIDI_CONTROL_CHANGE: number = 176;
const MIDI_NOTE_ON_EVENT: number = 144;
const MIDI_NOTE_OFF_EVENT: number = 128;

export default class MidiController implements IDisposable {

    private soundUnit!: SoundUnit;
    private learningControl: ISynthControl | undefined;

    private inputs: Map<string, WebMidi.MIDIPort> | undefined;
    private midiConnection: Rx.Subscription | undefined;
    private mappings = new Map<number, ISynthControl>();

    public setSoundUnit(soundUnit: SoundUnit): void {
        this.soundUnit = soundUnit;
    }

    public learn(ctrl: ISynthControl): void {
        if(this.learningControl) {
            this.learningControl.midiLearning = false;
        }
        this.learningControl = ctrl;
        ctrl.midiLearning = true;
    }

    public stopLearn(): void {
        this.learningControl = undefined;
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

        // disconnect from existing controller
        if (this.midiConnection) {
            this.midiConnection.unsubscribe();
        }

        // listent to MIDI events on the input
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
                        return;
                    case MIDI_NOTE_OFF_EVENT:
                        this.soundUnit.noteOff();
                        return;
                }
            }, (error) => console.error(error));
    }

    private handleControlChange(id: number, data: number): void {

        if (this.learningControl) {
            this.registerMapping(id, this.learningControl);
        }

        let mapped: ISynthControl | undefined;
        if (mapped = this.mappings.get(id)) {
            mapped.setValueByRatio(data / 127);
        }
    }

    private registerMapping(midiId: number, ctrl: ISynthControl): void {

        // unregister existing one (if any)
        var existingMapping: ISynthControl | undefined = this.mappings.get(midiId);
        if (existingMapping) {
            existingMapping.midiMappedTo = "";
        }

        // register (or override) new one
        ctrl.midiMappedTo = `${midiId}`;
        this.mappings.set(midiId, ctrl);
    }

    dispose(): void {
        if (this.midiConnection) {
            this.midiConnection.unsubscribe();
        }
    }
}
