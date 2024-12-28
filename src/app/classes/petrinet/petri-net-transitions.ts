import { Dfg } from '../dfg/dfg';

export interface PetriNetTransition {
    id: string;
}

export class Transition implements PetriNetTransition {
    readonly id: string;
    constructor(
        private readonly _name: string,
        idCount: number,
    ) {
        this.id = 't' + idCount;
    }

    get name(): string {
        return this._name;
    }
}

export class PetriNetTransitions {
    private readonly _transitions: Array<PetriNetTransition> = new Array();
    private idCount: number = 0;
    constructor() {}

    get transitions(): Array<PetriNetTransition> {
        return this._transitions;
    }

    addDFG(dfg: Dfg): PetriNetTransitions {
        if (dfg.isBaseCase()) {
            return this.createTransition(dfg.getBaseActivityName());
        }
        this._transitions.push(dfg);
        return this;
    }

    createTransition(transitionName: string): PetriNetTransitions {
        this._transitions.push(new Transition(transitionName, ++this.idCount));
        return this;
    }

    removeDFG(dfg: Dfg): PetriNetTransitions {
        this._transitions.splice(this._transitions.indexOf(dfg), 1);
        return this;
    }

    eachTransitionIsBaseCase(): boolean {
        for (const transition of this._transitions) {
            if (transition instanceof Dfg) {
                return false;
            }
        }
        return true;
    }

    getAllDFGs(): Dfg[] {
        const dfgs: Dfg[] = [];
        for (const transition of this.transitions) {
            if (transition instanceof Dfg) {
                dfgs.push(transition);
            }
        }
        return dfgs;
    }

    getLastTransition(): PetriNetTransition {
        return this._transitions[this._transitions.length - 1];
    }

    getTransitionByID(transitionID: string): PetriNetTransition {
        for (const transition of this._transitions) {
            if (transition.id === transitionID) {
                return transition;
            }
        }
        throw new Error('Transition not found');
    }

    getAllDFGs(): Array<Dfg> {
        const dfgs: Array<Dfg> = new Array<Dfg>();
        for (const transition of this._transitions) {
            if (transition instanceof Dfg) {
                dfgs.push(transition);
            }
        }
        return dfgs;
    }
}
