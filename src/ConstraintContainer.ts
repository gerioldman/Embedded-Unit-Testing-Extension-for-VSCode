export type ConstraintResult = {
    result: boolean;
    severity: string;
    message: string;
};

export type Constraint = {
    name: string;
    check : () => Promise<ConstraintResult>;
};


export abstract class IConstraintContainer {
    constructor(list : Array<Constraint>) {
        this.container = new Array<Constraint>();
        list.forEach(element => {
            this.container.push(element);
        });
    }

    container : Array<Constraint>;

    public async checkAll() : Promise<Array<ConstraintResult>> {
        return new Promise<Array<ConstraintResult>>(resolve => {
            let result : Array<ConstraintResult> = new Array<ConstraintResult>();
            for (let i = 0; i < this.container.length; i++) {
                this.container[i].check().then((value) => {
                    result.push(value);
                    if (i === this.container.length - 1) {
                        resolve(result);
                    }
                });
            }
        });
    }
}

