import * as Rx from 'rxjs/Rx';
import SoundUnit from './sound-unit';

const DEBOUNCE_MILLIS: number = 500;

type SignalEvent = [number, number, number, boolean]; // first value, latest value and time, isFirst

/**
 * Class responsible for the life-cycle of a particular "note". It analyzes the input
 * signal and modulates the given sound unit (until the end of the note life).
 */
export default class NoteHandler {

    public static startNote(soundUnit: SoundUnit, signal$: Rx.Observable<number>, done: () => void): void {

        soundUnit.noteOn();
        signal$
            .takeUntil(signal$.debounceTime(DEBOUNCE_MILLIS))
            .scan<number, SignalEvent>((acc: SignalEvent, value: number, index: number) => {
                return [index === 0 ? value : acc[0], value, Rx.Scheduler.animationFrame.now(), index === 0];
            })
            .pairwise()
            .subscribe(
                (value: SignalEvent[]) => soundUnit.modulate(new ModulationEvent(value)),
                (error: any) => console.error(error),
                () => {
                    soundUnit.noteOff();
                    done();
                });
    }
}

export enum Direction { Up, Down }

// tslint:disable-next-line: max-classes-per-file
export class ModulationEvent {

    public firstEvent: boolean;
    public absolute: number;
    public relative: number;
    public direction: Direction;
    public speed: number;

    constructor(lastValues: SignalEvent[]) {

        this.firstEvent = lastValues[0][3];
        const latest: SignalEvent = lastValues[lastValues.length - 1];
        this.absolute = latest[1];
        this.relative = latest[0] - latest[1];
        this.direction = lastValues[0][1] <= lastValues[1][1] ? Direction.Up : Direction.Down;

        const distance: number = Math.abs(lastValues[1][1] - lastValues[0][1]);
        const time: number = lastValues[1][2] - lastValues[0][2];
        this.speed = time > 0 ? distance / time : 0;
    }
}
