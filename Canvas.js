import { Bezier } from "./Bezier.js";
import { Spline } from "./Spline.js";
import { Vector } from "./Vector.js";

export class Canvas {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.splines = [];
        this.currentSpline = 0;
        this.currentCurve = 0;
        this.pointSize = 3;
        this.selectedPoints = [];
        this.selectedControlPoint = false;

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

        button = document.getElementById("delete_spline");
        button.addEventListener("click", (e) => {
            this.deleteSpline()
        });

        let select = document.getElementById("select");
        select.addEventListener("change", (e) => {
            this.splineSelectChanged();
        });
    }

    deleteSpline() {
        let select = document.getElementById("select");

        // check if any spline selected/exist
        if (select.length == 0)
            return;

        let index = select.selectedIndex;
        // remove spline from splines array
        this.splines.splice(index, 1);
        // remove item from HTMLSelectElement
        select.remove(index);
        // correct indexes on HTMLSelectElement's items' names
        for (let i = 0; i < select.length; i++) {
            select.item(i).text = "Zlepek " + (i+1);
        }

        // correct local pointers to selected spline
        this.currentSpline = select.selectedIndex;
        if (this.currentSpline == -1) {
            this.currentSpline = 0;
            this.currentCurve = 0;
        } else if (typeof this.splines[this.currentSpline] == "undefined" ||
                    this.splines[this.currentSpline].curves[0].points[2] == null)
            this.currentCurve = 0;
        else
            this.currentCurve = this.splines[this.currentSpline].curves.length;

        // rerender
        this.render();
    }

    splineSelectChanged()  {
        let select = document.getElementById("select");
        this.currentSpline = select.selectedIndex;
        if (typeof this.splines[this.currentSpline] == "undefined" ||
                    this.splines[this.currentSpline].curves[0].points[2] == null)
            this.currentCurve = 0;
        else
            this.currentCurve = this.splines[this.currentSpline].curves.length;
    }

    onMouseDown(e) {
        // check if there are any splices
        let select = document.getElementById("select");
        if (select.length == 0) {
            alert("Izbran ni noben zlepek. Dodajte nov zlepek.");
            return;
        }

        // get mouse coordinates
        let x = e.offsetX;
        let y = e.offsetY;

        // check if mouse pos on existing Point
        this.selectedPoints = [];

        for (let i = 0; i < this.splines.length; i++) {
            for (let j = 0; j < this.splines[i].curves.length; j++) {
                for (let k = 0; k < 4; k++) {
                    // check if mouse pos inside Point
                    let curve = this.splines[i].curves[j]
                    let point = curve.points[k];

                    // if point exists
                    if (point != null) {            
                        // if mouse cursor inside point
                        if (Math.abs(point.coor[0] - x) < this.pointSize+1 &&
                                    Math.abs(point.coor[1] - y) < this.pointSize+1) {
                            // add selected point
                            this.selectedPoints.push(point);

                            // select as interdependent points
                            switch (k) {
                                case 0:
                                    // add control point
                                    this.selectedPoints.push(curve.points[1]);
                                    // add main point
                                    this.selectedPoints.push(curve.points[0]);
                                    // add previous curve's (if it exists) control point
                                    if (j > 0) {
                                        this.selectedPoints.push(this.splines[i].curves[j-1].points[3]);
                                    }
                                    break;
                                case 1:
                                    // add main point and previous related control point (if previous curve exitst)
                                    if (j > 0) {
                                        this.selectedPoints.push(this.splines[i].curves[j-1].points[3]);
                                        this.selectedPoints.push(this.splines[i].curves[j-1].points[2]);
                                    }
                                    // flag that this is control point
                                    this.selectedControlPoint = true;
                                    break;
                                case 2:
                                    // add main point and next related control point (if next curve exists)
                                    if (j < this.splines[i].curves.length - 1) {
                                        this.selectedPoints.push(this.splines[i].curves[j+1].points[0]);
                                        this.selectedPoints.push(this.splines[i].curves[j+1].points[1]);
                                    }
                                    // flag that this is control point
                                    this.selectedControlPoint = true;
                                    break;
                                case 3:
                                    // add control point
                                    this.selectedPoints.push(curve.points[2])
                                    // add next curve's (if it exists) related control point
                                    if (j < this.splines[i].curves.length - 1) {
                                        this.selectedPoints.push(this.splines[i].curves[j+1].points[1]);
                                    }
                                    break;
                            }
                            return;
                        }
                    }
                }
            }
        }

        // if no points selected add new curve
        if (this.selectedPoints.length == 0) {
            if (this.currentCurve == 0 ) {
                if (typeof this.splines[this.currentSpline] == "undefined") {    
                    // first mouse down of the spline
                    let point_to_move = new Vector([x,y]);
                    this.splines.push(new Spline([
                        new Bezier([new Vector([x,y]), point_to_move, null, null])
                    ]));
                    this.selectedPoints = [point_to_move];
                } else {
                    // second mouse down of the spline
                    let point_to_move = new Vector([x, y]);
                    this.splines[this.currentSpline].curves[0].points[2] = new Vector([x, y]);
                    this.splines[this.currentSpline].curves[0].points[3] = point_to_move;
                    this.selectedPoints = [point_to_move];
                    this.currentCurve++;
                }
            } else {
                // set coordinates of the first point of new bezier to the coordinates of the
                // last point of last bezier
                let b = new Bezier([null, null, null, null]);
                let x3_last = this.splines[this.currentSpline].curves[this.currentCurve-1].points[3];
                b.points[0] = x3_last;
                
                // calculate coordinates of the second control point
                let x2_last = this.splines[this.currentSpline].curves[this.currentCurve-1].points[2];
                let x1_new = x2_last.sub(x3_last).mulScalar(-1).add(x3_last);
                b.points[1] = x1_new;

                // set third point to the location of mouseDown 
                b.points[2] = new Vector([x, y]);

                // set fourth point to selected point
                let point_to_move = new Vector([x, y]);
                b.points[3] = point_to_move;
                this.selectedPoints = [point_to_move];

                // add new curve to the spline
                this.splines[this.currentSpline].curves.push(b);
                this.currentCurve++;
            }
        }
    }

    onMouseUp(e) {
        // deselect selected points
        this.selectedPoints = []
        this.selectedControlPoint = false;

        // set cursor to default
        this.canvas.style.cursor = "default";
    }

    onMouseMove(e) {
        let x = e.offsetX;
        let x_movement = e.movementX;
        let y = e.offsetY;
        let y_movement = e.movementY;

        if (this.selectedPoints.length > 0) {
            // change cursor to "move"
            this.canvas.style.cursor = "move";
        } else {
            this.canvas.style.cursor = "default";
        }
        
        // move selected points
        if (this.selectedControlPoint && this.selectedPoints.length > 1) {
            // control point selected, other control point's coordinates have to be calculated
            let cp1 = this.selectedPoints[0];   // selected control point
            let mp = this.selectedPoints[1];    // main point
            let cp2 = this.selectedPoints[2];   // related control point

            cp1.coor = [x, y];
            // calculate related control point's coordinates
            cp2.coor = cp1.sub(mp).mulScalar(-1).add(mp).coor;
        } else {
            // move selected points
            for (let i = 0; i < this.selectedPoints.length; i++) {
                this.selectedPoints[i].coor =
                        this.selectedPoints[i].add(new Vector([x_movement, y_movement])).coor;
            }
        }

        // render
        this.render();
    }

    newSpline() {
        let select = document.getElementById("select");
        
        // set local pointers to a new spline
        this.currentSpline = select.length;
        this.currentCurve = 0;

        // set HTMLSelectElement to new item
        let newItem = document.createElement("option");
        newItem.text = "Zlepek " + (this.currentSpline +1);
        select.add(newItem);
        select.selectedIndex = select.length-1;
    }

    render() {
        // clear screen
        let canvas = document.getElementById("canvas");
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.splines.length; i++) {
            //draw curve
            if (this.splines[i].curves.length > 0 && this.splines[i].curves[0].points[2] != null) {
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

