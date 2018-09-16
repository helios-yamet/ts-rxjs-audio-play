import { ModulationEvent } from "./note-handler";

/**
 * A simple abtraction for something which can play some sound and
 * modulate it.
 */
export default abstract class SoundUnit implements IDisposable {

    public abstract noteOn(): void;

    public abstract modulate(modulation: ModulationEvent): void;

    public abstract noteOff(): void;

    public abstract dispose(): void;

    protected mapRange(value: number, min: number, max: number): number {
        return min + (max - min) * value / 100;
    }
}