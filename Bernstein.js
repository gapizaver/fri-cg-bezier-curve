function fac(n) { return n < 2 ? 1 : n * fac(n - 1) }

export class Bernstein {
    constructor(n, k) {
        this.n = n;
        this.k = k;
    }

    value(x) {
        if (typeof x == "number") {
            let bionimal = fac(this.n) / (fac(this.k) * fac(this.n - this.k));
            return bionimal * Math.pow(x, this.k) * Math.pow(1-x, this.n-this.k);
        }
        else 
            console.log("Argument funkcije value mora biti število");
    }
    
    derivative(x) {
        if (typeof x == "number") {
            let bn1k1 = new Bernstein(this.n-1, this.k-1);
            let bnk1 = new Bernstein(this.n, this.k-1);
    
            return this.n * (bn1k1.value(x) - bnk1.value(x));
        } else 
            console.log("Argument funkcije derivative mora biti število");
    }
}