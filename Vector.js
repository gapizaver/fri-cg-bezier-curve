export class Vector {

    constructor(coor) {
        if (coor instanceof Array)
            this.coor = coor;
        else
            console.log("argument Vector konstruktorja mora biti Array");
    }

    add(v) {
        if (v instanceof Vector) {
            return new Vector(this.coor.map((val, i) => val + v.coor[i]));
        }
        else
            console.log("argument funkcije div mora biti tipa Vector");
    }

    sub(v) {
        if (v instanceof Vector)
            return new Vector(this.coor.map((val, i) => val - v.coor[i]));
        else
            console.log("argument funkcije div mora biti tipa Vector");
    }

    mul(v) {
        if (v instanceof Vector)
            return new Vector(this.coor.map((val, i) => val * v.coor[i]));
        else
            console.log("argument funkcije div mora biti tipa Vector");
    }

    div(v) {
        if (v instanceof Vector)
            return new Vector(this.coor.map((val, i) => val / v.coor[i]));
        else
            console.log("argument funkcije div mora biti tipa Vector");
    }

    length() {
        let sq = this.mul(this);  // kvadrat vektorja
        let sum = 0;
        for (let i = 0; i < sq.coor.length; i+=1) {
            sum += m[i];
        }

        return sqrt(sum);
    }

    mulScalar(s) {
        if (typeof s == "number") {
            return new Vector(this.coor.map(i => i*s));
        } else {
            console.log("argument funkcije mulScalar mora biti float.");
        }
    }

    divScalar(s) {
        if (typeof s == "number") {
            return new Vector(this.coor.map(i => i/s));
        } else {
            console.log("argument funkcije mulScalar mora biti float.");
        }
    }
    
    toArray() {
        return this.coor;
    }
}
