import * as Rx from "rxjs/Rx";
import Note from "./notes/note2";

const DEBOUNCE_MILLIS: number = 500;

type SignalEvent = [number, number, number]; // first value, latest value and time

export default class NoteHandler {

    static startNote(signal$: Rx.Observable<number>, done: () => void): void {

        let note: Note = new Note(Math.random() > .5);
        note.noteOn();

        signal$
            .scan<number, SignalEvent>((acc:SignalEvent, value: number, index: number) =>
                [index === 0 ? value : acc[0], value, Rx.Scheduler.animationFrame.now()],
                [0, 0, 0])
            .pairwise()
            .takeUntil(signal$.debounceTime(DEBOUNCE_MILLIS))
            .subscribe(
                (value: SignalEvent[]) => note.modulate(new ModulationEvent(value)),
                (error: any) => console.error(error),
                () => {
                    note.noteOff();
                    note.dispose();
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