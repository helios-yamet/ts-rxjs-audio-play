
export enum Vowel {
    Soprano_A,
    Soprano_E,
    Soprano_I,
    Soprano_O,
    Soprano_U,
    Alto_A,
    Alto_E,
    Alto_I,
    Alto_O,
    Alto_U,
    Countertenor_A,
    Countertenor_E,
    Countertenor_I,
    Countertenor_O,
    Countertenor_U,
    Tenor_A,
    Tenor_E,
    Tenor_I,
    Tenor_O,
    Tenor_U,
    Bass_A,
    Bass_E,
    Bass_I,
    Bass_O,
    Bass_U,
}

/**
 * Formant table converted from
 * https://www.classes.cs.uchicago.edu/archive/1999/spring/CS295/Computing_Resources/Csound/CsManual3.48b1.HTML/Appendices/table3.html
 */
export default class FormantDefinitions {

    /**
     * Return formants as tuples of frequency/amplitude/bandwidth
     * @param type the type of formant to return
     */
    public static formantsFor(type: Vowel): [number, number, number][] {

        switch (type) {

            case Vowel.Soprano_A:
                return [
                    [800, 0, 80],
                    [1150, -6, 90],
                    [2900, -32, 120],
                    [3900, -20, 130],
                    [4950, -50, 140]
                ];
            case Vowel.Soprano_E:
                return [
                    [350, 0, 60],
                    [2000, -20, 100],
                    [2800, -15, 120],
                    [3600, -40, 150],
                    [4950, -56, 200]
                ];
            case Vowel.Soprano_I:
                return [
                    [270, 0, 60],
                    [2140, -12, 90],
                    [2950, -26, 100],
                    [3900, -26, 120],
                    [4950, -44, 120]
                ];
            case Vowel.Soprano_O:
                return [
                    [450, 0, 70],
                    [800, -11, 80],
                    [2830, -22, 100],
                    [3800, -22, 130],
                    [4950, -50, 135]
                ];
            case Vowel.Soprano_U:
                return [
                    [325, 0, 50],
                    [700, -16, 60],
                    [2700, -35, 170],
                    [3800, -40, 180],
                    [4950, -60, 200]
                ];

            case Vowel.Alto_A:
                return [
                    [800, 0, 80],
                    [1150, -4, 90],
                    [2800, -20, 120],
                    [3500, -36, 130],
                    [4950, -60, 140]
                ];
            case Vowel.Alto_E:
                return [
                    [400, 0, 60],
                    [1600, -24, 80],
                    [2700, -30, 120],
                    [3300, -35, 150],
                    [4950, -60, 200]
                ];
            case Vowel.Alto_I:
                return [
                    [350, 0, 50],
                    [1700, -20, 100],
                    [2700, -30, 120],
                    [3700, -36, 150],
                    [4950, -60, 200]
                ];
            case Vowel.Alto_O:
                return [
                    [450, 0, 70],
                    [800, -9, 80],
                    [2830, -16, 100],
                    [3500, -28, 130],
                    [4950, -55, 135]
                ];
            case Vowel.Alto_U:
                return [
                    [325, 0, 50],
                    [700, -12, 60],
                    [2530, -30, 170],
                    [3500, -40, 180],
                    [4950, -64, 200]
                ];
            case Vowel.Countertenor_A:
                return [
                    [660, 0, 80],
                    [1120, -6, 90],
                    [2750, -23, 120],
                    [3000, -24, 130],
                    [3350, -38, 140]
                ];
            case Vowel.Countertenor_E:
                return [
                    [440, 0, 70],
                    [1800, -14, 80],
                    [2700, -18, 100],
                    [3000, -20, 120],
                    [3300, -20, 120]
                ];
            case Vowel.Countertenor_I:
                return [
                    [270, 0, 40],
                    [1850, -24, 90],
                    [2900, -24, 100],
                    [3350, -36, 120],
                    [3590, -36, 120]
                ];
            case Vowel.Countertenor_O:
                return [
                    [430, 0, 40],
                    [820, -10, 80],
                    [2700, -26, 100],
                    [3000, -22, 120],
                    [3300, -34, 120]
                ];
            case Vowel.Countertenor_U:
                return [
                    [370, 0, 40],
                    [630, -20, 60],
                    [2750, -23, 100],
                    [3000, -30, 120],
                    [3400, -34, 120]
                ];
            case Vowel.Tenor_A:
                return [
                    [650, 0, 80],
                    [1080, -6, 90],
                    [2650, -7, 120],
                    [2900, -8, 130],
                    [3250, -22, 140]
                ];
            case Vowel.Tenor_E:
                return [
                    [400, 0, 70],
                    [1700, -14, 80],
                    [2600, -12, 100],
                    [3200, -14, 120],
                    [3580, -20, 120]
                ];
            case Vowel.Tenor_I:
                return [
                    [290, 0, 40],
                    [1870, -15, 90],
                    [2800, -18, 100],
                    [3250, -20, 120],
                    [3540, -30, 120]
                ];
            case Vowel.Tenor_O:
                return [
                    [400, 0, 40],
                    [800, -10, 80],
                    [2600, -12, 100],
                    [2800, -12, 120],
                    [3000, -26, 120]
                ];
            case Vowel.Tenor_U:
                return [
                    [350, 0, 40],
                    [600, -20, 60],
                    [2700, -17, 100],
                    [2900, -14, 120],
                    [3300, -26, 120]
                ];
            case Vowel.Bass_A:
                return [
                    [600, 0, 60],
                    [1040, -7, 70],
                    [2250, -9, 110],
                    [2450, -9, 120],
                    [2750, -20, 130]
                ];
            case Vowel.Bass_E:
                return [
                    [400, 0, 40],
                    [1620, -12, 80],
                    [2400, -9, 100],
                    [2800, -12, 120],
                    [3100, -18, 120]
                ];
            case Vowel.Bass_I:
                return [
                    [250, 0, 60],
                    [1750, -30, 90],
                    [2600, -16, 100],
                    [3050, -22, 120],
                    [3340, -28, 120]
                ];
            case Vowel.Bass_O:
                return [
                    [400, 0, 40],
                    [750, -11, 80],
                    [2400, -21, 100],
                    [2600, -20, 120],
                    [2900, -40, 120]
                ];
            case Vowel.Bass_U:
                return [
                    [350, 0, 40],
                    [600, -20, 80],
                    [2400, -32, 100],
                    [2675, -28, 120],
                    [2950, -36, 120]
                ];
            default:
                throw `Formant type '${type}' is not supported`;
        }
    }
}