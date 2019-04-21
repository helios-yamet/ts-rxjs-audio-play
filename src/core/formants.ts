
export enum Vowel {
    A_Bass,
    A_Tenor,
    A_Countertenor,
    A_Alto,
    A_Soprano,
    E_Bass,
    E_Tenor,
    E_Countertenor,
    E_Alto,
    E_Soprano,
    I_Bass,
    I_Tenor,
    I_Countertenor,
    I_Alto,
    I_Soprano,
    O_Bass,
    O_Tenor,
    O_Countertenor,
    O_Alto,
    O_Soprano,
    U_Bass,
    U_Tenor,
    U_Countertenor,
    U_Alto,
    U_Soprano,
}

export interface IFormantDefinition {
    name: string;
    vowel: Vowel;
    formants: Array<[number, number, number]>;
}

/**
 * Formant table converted from "HTML Csound Manual - © Jean Piché & Peter J. Nix, 1994-97"
 * >> http://tinyurl.com/mklt5p5
 */
export default class Formants {

    public static all: IFormantDefinition[] = [
        { name: "A Bass", vowel: Vowel.A_Bass, formants: Formants.formantsFor(Vowel.A_Bass) },
        { name: "A Tenor", vowel: Vowel.A_Tenor, formants: Formants.formantsFor(Vowel.A_Tenor) },
        { name: "A C-tenor", vowel: Vowel.A_Countertenor, formants: Formants.formantsFor(Vowel.A_Countertenor) },
        { name: "A Alto", vowel: Vowel.A_Alto, formants: Formants.formantsFor(Vowel.A_Alto) },
        { name: "A Soprano", vowel: Vowel.A_Soprano, formants: Formants.formantsFor(Vowel.A_Soprano) },
        { name: "E Bass", vowel: Vowel.E_Bass, formants: Formants.formantsFor(Vowel.E_Bass) },
        { name: "E Tenor", vowel: Vowel.E_Tenor, formants: Formants.formantsFor(Vowel.E_Tenor) },
        { name: "E C-tenor", vowel: Vowel.E_Countertenor, formants: Formants.formantsFor(Vowel.E_Countertenor) },
        { name: "E Alto", vowel: Vowel.E_Alto, formants: Formants.formantsFor(Vowel.E_Alto) },
        { name: "E Soprano", vowel: Vowel.E_Soprano, formants: Formants.formantsFor(Vowel.E_Soprano) },
        { name: "I Bass", vowel: Vowel.I_Bass, formants: Formants.formantsFor(Vowel.I_Bass) },
        { name: "I Tenor", vowel: Vowel.I_Tenor, formants: Formants.formantsFor(Vowel.I_Tenor) },
        { name: "I C-tenor", vowel: Vowel.I_Countertenor, formants: Formants.formantsFor(Vowel.I_Countertenor) },
        { name: "I Alto", vowel: Vowel.I_Alto, formants: Formants.formantsFor(Vowel.I_Alto) },
        { name: "I Soprano", vowel: Vowel.I_Soprano, formants: Formants.formantsFor(Vowel.I_Soprano) },
        { name: "O Bass", vowel: Vowel.O_Bass, formants: Formants.formantsFor(Vowel.O_Bass) },
        { name: "O Tenor", vowel: Vowel.O_Tenor, formants: Formants.formantsFor(Vowel.O_Tenor) },
        { name: "O C-tenor", vowel: Vowel.O_Countertenor, formants: Formants.formantsFor(Vowel.O_Countertenor) },
        { name: "O Alto", vowel: Vowel.O_Alto, formants: Formants.formantsFor(Vowel.O_Alto) },
        { name: "O Soprano", vowel: Vowel.O_Soprano, formants: Formants.formantsFor(Vowel.O_Soprano) },
        { name: "U Bass", vowel: Vowel.U_Bass, formants: Formants.formantsFor(Vowel.U_Bass) },
        { name: "U Tenor", vowel: Vowel.U_Tenor, formants: Formants.formantsFor(Vowel.U_Tenor) },
        { name: "U C-tenor", vowel: Vowel.U_Countertenor, formants: Formants.formantsFor(Vowel.U_Countertenor) },
        { name: "U Alto", vowel: Vowel.U_Alto, formants: Formants.formantsFor(Vowel.U_Alto) },
        { name: "U Soprano", vowel: Vowel.U_Soprano, formants: Formants.formantsFor(Vowel.U_Soprano) }];

    /**
     * Return formants as tuples of frequency/amplitude/bandwidth
     * @param type the type of formant to return
     */
    public static formantsFor(type: Vowel, nb?: number): Array<[number, number, number]> {

        const formants: Array<[number, number, number]> = this.buildFormantsFor(type);
        if (nb) {
            formants.splice(nb);
        }
        return formants;
    }

    private static buildFormantsFor(type: Vowel): Array<[number, number, number]> {

        switch (type) {

            case Vowel.A_Bass:
                return [
                    [600, 0, 60],
                    [1040, -7, 70],
                    [2250, -9, 110],
                    [2450, -9, 120],
                    [2750, -20, 130],
                ];
            case Vowel.A_Tenor:
                return [
                    [650, 0, 80],
                    [1080, -6, 90],
                    [2650, -7, 120],
                    [2900, -8, 130],
                    [3250, -22, 140],
                ];
            case Vowel.A_Countertenor:
                return [
                    [660, 0, 80],
                    [1120, -6, 90],
                    [2750, -23, 120],
                    [3000, -24, 130],
                    [3350, -38, 140],
                ];
            case Vowel.A_Alto:
                return [
                    [800, 0, 80],
                    [1150, -4, 90],
                    [2800, -20, 120],
                    [3500, -36, 130],
                    [4950, -60, 140],
                ];
            case Vowel.A_Soprano:
                return [
                    [800, 0, 80],
                    [1150, -6, 90],
                    [2900, -32, 120],
                    [3900, -20, 130],
                    [4950, -50, 140],
                ];
            case Vowel.E_Bass:
                return [
                    [400, 0, 40],
                    [1620, -12, 80],
                    [2400, -9, 100],
                    [2800, -12, 120],
                    [3100, -18, 120],
                ];
            case Vowel.E_Tenor:
                return [
                    [400, 0, 70],
                    [1700, -14, 80],
                    [2600, -12, 100],
                    [3200, -14, 120],
                    [3580, -20, 120],
                ];
            case Vowel.E_Countertenor:
                return [
                    [440, 0, 70],
                    [1800, -14, 80],
                    [2700, -18, 100],
                    [3000, -20, 120],
                    [3300, -20, 120],
                ];
            case Vowel.E_Alto:
                return [
                    [400, 0, 60],
                    [1600, -24, 80],
                    [2700, -30, 120],
                    [3300, -35, 150],
                    [4950, -60, 200],
                ];
            case Vowel.E_Soprano:
                return [
                    [350, 0, 60],
                    [2000, -20, 100],
                    [2800, -15, 120],
                    [3600, -40, 150],
                    [4950, -56, 200],
                ];
            case Vowel.I_Bass:
                return [
                    [250, 0, 60],
                    [1750, -30, 90],
                    [2600, -16, 100],
                    [3050, -22, 120],
                    [3340, -28, 120],
                ];
            case Vowel.I_Tenor:
                return [
                    [290, 0, 40],
                    [1870, -15, 90],
                    [2800, -18, 100],
                    [3250, -20, 120],
                    [3540, -30, 120],
                ];
            case Vowel.I_Countertenor:
                return [
                    [270, 0, 40],
                    [1850, -24, 90],
                    [2900, -24, 100],
                    [3350, -36, 120],
                    [3590, -36, 120],
                ];
            case Vowel.I_Alto:
                return [
                    [350, 0, 50],
                    [1700, -20, 100],
                    [2700, -30, 120],
                    [3700, -36, 150],
                    [4950, -60, 200],
                ];
            case Vowel.I_Soprano:
                return [
                    [270, 0, 60],
                    [2140, -12, 90],
                    [2950, -26, 100],
                    [3900, -26, 120],
                    [4950, -44, 120],
                ];
            case Vowel.O_Bass:
                return [
                    [400, 0, 40],
                    [750, -11, 80],
                    [2400, -21, 100],
                    [2600, -20, 120],
                    [2900, -40, 120],
                ];
            case Vowel.O_Tenor:
                return [
                    [400, 0, 40],
                    [800, -10, 80],
                    [2600, -12, 100],
                    [2800, -12, 120],
                    [3000, -26, 120],
                ];
            case Vowel.O_Countertenor:
                return [
                    [430, 0, 40],
                    [820, -10, 80],
                    [2700, -26, 100],
                    [3000, -22, 120],
                    [3300, -34, 120],
                ];
            case Vowel.O_Alto:
                return [
                    [450, 0, 70],
                    [800, -9, 80],
                    [2830, -16, 100],
                    [3500, -28, 130],
                    [4950, -55, 135],
                ];
            case Vowel.O_Soprano:
                return [
                    [450, 0, 70],
                    [800, -11, 80],
                    [2830, -22, 100],
                    [3800, -22, 130],
                    [4950, -50, 135],
                ];
            case Vowel.U_Bass:
                return [
                    [350, 0, 40],
                    [600, -20, 80],
                    [2400, -32, 100],
                    [2675, -28, 120],
                    [2950, -36, 120],
                ];
            case Vowel.U_Tenor:
                return [
                    [350, 0, 40],
                    [600, -20, 60],
                    [2700, -17, 100],
                    [2900, -14, 120],
                    [3300, -26, 120],
                ];
            case Vowel.U_Countertenor:
                return [
                    [370, 0, 40],
                    [630, -20, 60],
                    [2750, -23, 100],
                    [3000, -30, 120],
                    [3400, -34, 120],
                ];
            case Vowel.U_Alto:
                return [
                    [325, 0, 50],
                    [700, -12, 60],
                    [2530, -30, 170],
                    [3500, -40, 180],
                    [4950, -64, 200],
                ];
            case Vowel.U_Soprano:
                return [
                    [325, 0, 50],
                    [700, -16, 60],
                    [2700, -35, 170],
                    [3800, -40, 180],
                    [4950, -60, 200],
                ];
            default:
                throw new Error(`Formant type '${type}' is not supported`);
        }
    }
}
