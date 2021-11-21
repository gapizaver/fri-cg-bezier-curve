export class Spline {
    constructor (curves, color = "#000000") {
        if (!curves instanceof Array) {
            console.log("Argument Sline konstruktorja curves mora biti tipa Array");
        } else if (!color instanceof String){
            console.log("Argument Spline konstructorja color mora biti tipa String");
        } else {
            this.curves = curves;
            this.color = color;
        }
    }

    value(t) {
        if (typeof t != "number") {
            console.out("Argument funkcije Spline.value mora biti število");
            return;
        }
        
        // check if int
        if (t === parseInt(t, 10) && t != 0)
            return this.curves[t-1].value(1);
        else
            return this.curves[Math.floor(t)].value(t - Math.floor(t));
    }

    derivative(t) {
        if (typeof t != "number") {
            console.out("Argument funkcije Spline.value mora biti število");
            return;
        }

        return this.curves[Math.floor(t)].derivative(t - Math.floor(t));
    }

    makeContinuous() {
        // make C0 continuity
        for (let i; i < this.curves.length-1; i++) {
            let v = this.curves[i].points[3].add(this.curves[i+1].points[0]);
            v = v.divScalar(2)
            this.curves[i].points[3].coor[0] = v.coor[0];
            this.curves[i].points[3].coor[1] = v.coor[1];
            this.curves[i+1].points[0].coor[0] = v.coor[0];
            this.curves[i+1].points[0].coor[1] = v.coor[1];
        }
    }

    makeSmooth() {
        this.makeContinuous();

        // make C2 continuity
        for (let i = 0; i < this.curves-length-1; i++) {
            let derivativeAvg = (this.curves[i].derivative(1) + this.curves[i+1].derivative(0)) / 2;
            let n = this.curves[i+1].points.length;
            this.curves[i+1].points[1] = this.curves[i+1].points[0].add(derivativeAvg/n);
            n = this.curves[i].points.length;
            this.curves[i].points[n-2] = this.curves[i].points[n-1].add(-1*derivativeAvg/n);
        }
    }
}