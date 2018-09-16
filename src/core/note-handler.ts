import * as Rx from "rxjs/Rx";
import SoundUnit from "./sound-unit";

const DEBOUNCE_MILLIS: number = 500;

type SignalEvent = [number, number, number]; // first value, latest value and time

/**
 * Class responsible for the life-cycle of a particular "note". It analyzes the input
 * signal and modulates the given sound unit (until the end of the note life).
 */
export default class NoteHandler {

    static startNote(soundUnit: SoundUnit, signal$: Rx.Observable<number>, done: () => void): void {

        soundUnit.noteOn();
        signal$
            .takeUntil(signal$.debounceTime(DEBOUNCE_MILLIS))
            .scan<number, SignalEvent>((acc:SignalEvent, value: number, index: number) =>
                [index === 0 ? value : acc[0], value, Rx.Scheduler.animationFrame.now()],
                [0, 0, 0])
            .pairwise()
            .subscribe(
                (value: SignalEvent[]) => soundUnit.modulate(new ModulationEvent(value)),
                (error: any) => console.error(error),
                () => {
                    soundUnit.noteOff();
                    soundUnit.dispose();
                    done();
                });
    }
}

export enum Direction { Up, Down }

// todo -> improve this, document it and test it properly
export class ModulationEvent {

    public absolute: number;
    public relative: number;
    public direction: Direction;
    public speed: number;

    constructor(lastValues: SignalEvent[]) {

        let latest: SignalEvent = lastValues[lastValues.length-1];
        this.absolute = latest[1];
        this.relative = latest[0] - latest[1];
        this.direction = lastValues[0][1] <= lastValues[1][1] ? Direction.Up : Direction.Down;

        let distance: number = Math.abs(lastValues[1][1] - lastValues[0][1]);
        let time: number = lastValues[1][2] - lastValues[0][2];
        this.speed = time > 0 ? distance / time : 0;
    }
}