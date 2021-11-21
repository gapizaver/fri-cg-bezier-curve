import { Bernstein } from "./Bernstein.js";
import { Vector } from "./Vector.js";

export class Bezier {
    constructor(points) {
        if (!points instanceof Array) {
            console.log("Argument Bezier konstruktorja mora biti Array");
        } else {
            this.points = points;
        }
    }

    value(t) {
        if (typeof t != "number") {
            console.log("Argument funkcije value mora biti število");
        } else {
            let v_length = this.points[0].coor.length;
            let v = new Vector(Array(v_length).fill(0));
            let n = this.points.length;

            for (let i = 0; i < n; i+=1) {
                let bernstein = new Bernstein(n-1, i);
                v = v.add(this.points[i].mulScalar(bernstein.value(t)));
            }

            return v;
        }
    }

    derivative(t) {
        if (typeof t != "number") {
            console.log("Argument funkcije value mora biti število");
        } else {
            let v_length = this.points[0].coor.length;
            let v = new Vector(Array(v_length).fill(0));
            let n = this.points.length;

            for (let i = 0; i < n-1; i+=1) {
                let bernstein = new Bernstein(n-2, i);
                let v1 = this.points[i+1].sub(this.points[i]);
                v = v.add(v1.mulScalar(bernstein.value(t)));
            }

            return v.mulScalar(n-1);
        }
    }
}