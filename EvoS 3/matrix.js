class Matrix{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;

        this.data = [];

        for (let i = 0; i < rows; i++) {
            let arr = [];
            for (let j = 0; j < cols; j++) {
                arr.push(0);
            }   
            
            this.data.push(arr);
        }
    }

    static matrixToString(obj){
        let str = "";
        let row = 0;

        obj.map((elm, i, j) => {
            if(i != row){
                str += "\n";
                row = i;
            }

            str += "(" + i + "," + j + ")" + " - " + elm + "; ";
        })

        return str;
    }

    static arrayToMatrix(arr){
        var matrix = new Matrix(arr.length, 1);

        matrix.map((elm, i, j) => {
            return arr[i];
        })

        return matrix;
    }

    static matrixToArray(obj){
        let arr = [];

        obj.map((elm, i, j) => {
            arr.push(elm);
        })

        return arr;
    }

    print(){
        console.table(this.data);
    }

    randomize(){
        this.map((elm, i, j) => {
            return (Math.random() * 2) - 1
        });
    }

    miniRandomize(rate){
        if(rate == null)
            rate = 1;

        this.map((elm, i, j) => {
            let addOrSub = true;

            if(Math.random() > 0.5){
                addOrSub = !addOrSub;
            }
            if(addOrSub){
                return (elm + (Math.random()*elm)*rate)
            }
            else{
                return (elm - (Math.random()*elm)*rate)
            }
        });    
    }

    static map(A, func){
        let matrix = new Matrix(A.rows, A.cols);

        matrix.data = A.data.map((arr, i) => {
            return arr.map((num, j) => {
                return func(num, i, j);
            })
        })

        return matrix;
    }
    
    map(func){
        this.data = this.data.map((arr, i) => {
            return arr.map((num, j) => {
                return func(num, i, j);
            })
        })

        return this;
    }

    static transpose(A){
        var matrix = new Matrix(A.cols, A.rows);

        matrix.map((num,i,j) => {
            return A.data[j][i]
        });

        return matrix;
    }

    // Matriz x Escalar
    static escalarMultiply(A, escalar){
        var matrix = new Matrix(A.rows, A.cols);

        matrix.map((num, i, j) => {
            return A.data[i][j] * escalar
        });

        return matrix;
    }

    // Matriz x Matriz
    static hadamard(A, B){
        var matrix = new Matrix(A.rows, B.cols);

        matrix.map((num, i, j) => {
            return A.data[i][j] * B.data[i][j]
        });

        return matrix;
    }

    static add(A, B){
        var matrix = new Matrix(A.rows, B.cols);

        matrix.map((num, i, j) => {
            return A.data[i][j] + B.data[i][j]
        });

        return matrix;
    }

    static sub(A, B){
        var matrix = new Matrix(A.rows, B.cols);

        matrix.map((num, i, j) => {
            return A.data[i][j] - B.data[i][j]
        });

        return matrix;
    }

    static multiply(A, B){
        var matrix = new Matrix(A.rows, B.cols);

        matrix.map((num, i, j) => {
            let sum = 0;

            for (let k = 0; k < A.cols; k++) {
                let elm1 = A.data[i][k];
                let elm2 = B.data[k][j];

                sum += elm1 * elm2;
            }

            return sum;
        })

        return matrix;
    }
}