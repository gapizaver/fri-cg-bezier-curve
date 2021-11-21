import { Bezier } from "./Bezier.js";
import { Spline } from "./Spline.js";
import { Vector } from "./Vector.js";

export class Canvas {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.splines = [];
        this.currentSpline = 0;
        this.currentCurve = 0;
        this.pointSize = 3;

        // listeners
        canvas.addEventListener("mousemove", (e) => {
            this.onMouseMove(e);
        }, false);

        canvas.addEventListener("mousedown", (e) => {
            this.onMouseDown(e);
        }, false);

        canvas.addEventListener("mouseup", (e) => {
            this.onMouseUp(e);
        }, false);

        let button = document.getElementById("new_spline");
        button.addEventListener("click", (e) => {
            this.newSpline();
        }, false);
    }

    onMouseDown(e) {
        let x = e.offsetX;
        let y = e.offsetY;

        if (this.currentCurve == 0 ) {
            if (typeof this.splines[this.currentSpline] == "undefined") {    // first mouse down of the spline
                this.splines.push(new Spline([
                    new Bezier([new Vector([x,y]), null, null, null])
                ]));
            } else {                                                         // second mouse down of the spline
                this.splines[this.currentSpline].curves[0].points[2] = new Vector([x, y]);
                this.currentCurve++;
            }
        } else {
            // set coordinates of the first point of new bezier to the coordinates of the
            // last point of last bezier
            let b = new Bezier([null, null, null, null]);
            let x3_last = this.splines[this.currentSpline].curves[this.currentCurve-1].points[3];
            b.points[0] = x3_last;
            
            // calculate coordinates of the second point
            let x2_last = this.splines[this.currentSpline].curves[this.currentCurve-1].points[2];
            let x1_new = x2_last.sub(x3_last).mulScalar(-1).add(x3_last);
            b.points[1] = x1_new;

            // set third point to the location of mouseDown 
            b.points[2] = new Vector([x, y]);

            // add new curve to the spline
            this.splines[this.currentSpline].curves.push(b);
            this.currentCurve++;
        }
    }

    onMouseUp(e) {
        if (typeof this.splines[this.currentSpline] != "undefined") {
            let x = e.offsetX;
            let y = e.offsetY;

            // first mouse up
            if (this.currentCurve == 0 ) {
                if (this.splines[this.currentSpline].curves[this.currentCurve].points[1] == null) {     // first mouse down of the spline
                    this.splines[this.currentSpline].curves[this.currentCurve].points[1] = new Vector([x, y]);
                }
            } else if (this.currentCurve == 1) {       // second mouse up of the spline
                    this.splines[this.currentSpline].curves[this.currentCurve-1].points[3] = new Vector([x, y]);
            } else {
                // set coordinates of fourth point to the location of mouseUp
                this.splines[this.currentSpline].curves[this.currentCurve-1].points[3] = new Vector([x, y]);
            }
            
            this.render();
        } else {
            console.log("onMouseUp this.splines[this.currentspline] not defined");
        }
    }

    onMouseMove(e) {
    }

    newSpline() {
        if (this.splines[this.currentSpline] == null) {
            alert();
            return;
        }

        this.currentSpline++;
        this.currentCurve = 0;
    }

    render() {
        for (let i = 0; i < this.splines.length; i++) {
            //draw line
            if (this.currentCurve > 0) {
                this.ctx.setLineDash([]);

                this.ctx.beginPath();
                for (let j = 0; j < this.splines[i].curves.length; j+=0.01) {
                    let v = this.splines[i].value(j);
                    if (j == 0)
                        this.ctx.moveTo(v.coor[0], v.coor[1]);
                    else
                        this.ctx.lineTo(v.coor[0], v.coor[1]);
                }
                let v = this.splines[i].value(this.splines[i].curves.length);
                this.ctx.lineTo(v.coor[0], v.coor[1]);
                this.ctx.stroke();
            }

            // draw points
            this.ctx.setLineDash([]);
            for (let j = 0; j < this.splines[i].curves.length; j++) {
                let max = 4
                if (j == 0 && this.splines[i].curves[0].points[2] == null)
                    // spline only has 2 points draw only firts two
                    max = 2;

                for (let k = 0; k < max; k++) {
                    let x = this.splines[i].curves[j].points[k].coor[0];
                    let y = this.splines[i].curves[j].points[k].coor[1];
                    
                    // draw points
                    this.ctx.beginPath();
                    if (k == 0 || k == 3) {
                        // draw circle
                        this.ctx.arc(x, y, this.pointSize, 0, 2*Math.PI, false);
                        } else {
                        // draw square
                        this.ctx.rect(x-this.pointSize, y-this.pointSize, this.pointSize*2, this.pointSize*2);
                    }
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }

            // draw dotted line
            this.ctx.setLineDash([10, 10]);
            for (let j = 0; j < this.splines[i].curves.length; j++) {
                let max = 4;
                if (j == 0 && this.splines[i].curves[0].points[2] == null)
                    // spline only has 2 points draw only firts two
                    max = 2;

                for (let k = 0; k < max; k++) {
                    let x = this.splines[i].curves[j].points[k].coor[0];
                    let y = this.splines[i].curves[j].points[k].coor[1];
                    
                    if (k == 0 || k == 2) {
                        // start drawing line
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y);
                    } else {
                        // finish line
                        this.ctx.lineTo(x, y);
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
}

