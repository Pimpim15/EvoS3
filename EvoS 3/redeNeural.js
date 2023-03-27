function sigmoid(x){
    return 1 / (1 + exp(-x));
}

function dSigmoid(x){
    return x * (1 - x);
}

class RedeNeural{
    constructor(inputNodes, hiddenNodes1, hiddenNodes2, outputNodes){
        this.inputNodes = inputNodes;
        this.hiddenNodes1 = hiddenNodes1;
        this.hiddenNodes2 = hiddenNodes2;
        this.outputNodes = outputNodes;

        this.biasIH = new Matrix(this.hiddenNodes1, 1);

        this.biasIH.randomize();

        this.biasHH = new Matrix(this.hiddenNodes2, 1);

        this.biasHH.randomize();

        this.biasHO = new Matrix(this.outputNodes, 1);

        this.biasHO.randomize();

        this.weightIH = new Matrix(this.hiddenNodes1, this.inputNodes);
        this.weightIH.randomize();

        this.weightHH = new Matrix(this.hiddenNodes2, this.hiddenNodes1);
        this.weightHH.randomize();

        this.weightHO = new Matrix(this.outputNodes, this.hiddenNodes1);
        this.weightHO.randomize();

        this.learningRate = 0.2;
    }

    feedForward(arr){
        // INPUT -> HIDDEN

        let input = Matrix.arrayToMatrix(arr);

        let hidden = Matrix.multiply(this.weightIH * input);

        hidden = Matrix.add(hidden, this.biasIH)

        hidden.map(sigmoid)

        // HIDDEN -> OUTPUT

        let output = Matrix.multiply(this.weightHO, hidden);

        output = Matrix.add(output, this.biasHO)

        output.map(sigmoid);
    }

    train(arr, target){
        // INPUT -> HIDDEN

        let input = Matrix.arrayToMatrix(arr);

        let hidden = Matrix.multiply(this.weightIH, input);

        hidden = Matrix.add(hidden, this.biasIH)

        hidden.map(sigmoid)

        // HIDDEN -> OUTPUT

        let output = Matrix.multiply(this.weightHO, hidden);

        output = Matrix.add(output, this.biasHO)

        output.map(sigmoid);

        /* BACKPROPAGATION */
            // OUTPUT -> HIDDEN
            let expected = Matrix.arrayToMatrix(target);

            let outputError = Matrix.sub(expected, output);

            let dOutput = Matrix.map(output, dSigmoid);

            let hiddenTransp = Matrix.transpose(hidden);

            let gradient = Matrix.hadamard(outputError, dOutput);

            gradient = Matrix.escalarMultiply(gradient, this.learningRate);  
            
            // ADJUST BIAS O -> H
            this.biasHO = Matrix.add(this.biasHO, gradient);

            // ADJUST WEIGHTS 0 -> H
            let weightHODeltas = Matrix.multiply(gradient, hiddenTransp);

            this.weightHO = Matrix.add(this.weightHO, weightHODeltas);

            // HIDDEN -> INPUT
            let weightHOTransp = Matrix.transpose(this.weightHO);

            let hiddenError = Matrix.multiply(weightHOTransp, outputError);

            let dHidden = Matrix.map(hidden, dSigmoid);

            let inputTransp = Matrix.transpose(input);

            let gradientHidden = Matrix.hadamard(hiddenError, dHidden);

            gradientHidden = Matrix.escalarMultiply(gradientHidden, this.learningRate);

            // ADJUST BIAS H -> I
            this.biasIH = Matrix.add(this.biasIH, gradientHidden);

            // ADJUST WEIGHTS H -> I
            let weightIHDeltas = Matrix.multiply(gradientHidden, inputTransp);

            this.weightIH = Matrix.add(this.weightIH, weightIHDeltas);
        /* End */
    }

    predict(arr){
        // INPUT -> HIDDEN1
        let greatestOutput = 0;

        let input = Matrix.arrayToMatrix(arr);

        let hidden1 = Matrix.multiply(this.weightIH, input);

        hidden1 = Matrix.add(hidden1, this.biasIH)

        hidden1.map(sigmoid)

        // HIDDEN1 -> HIDDEN2
        let hidden2 = Matrix.multiply(this.weightHH, hidden1);

        hidden2 = Matrix.add(hidden2, this.biasHH)

        hidden2.map(sigmoid);

        // HIDDEN2 -> OUTPUT
        let output = Matrix.multiply(this.weightHO, hidden2);

        output = Matrix.add(output, this.biasHO)

        output.map(sigmoid);

        output = Matrix.matrixToArray(output);

        for (let i = 0; i < 8; i++) {            
            if(i == 0 || output[i] > output[greatestOutput]){
                greatestOutput = i;
            }
        }

        for (let i = 0; i < 8; i++) {
            if(i == greatestOutput && output[i] > 0.9){
                output[i] = 1;
            }
            else{
                output[i] = 0;
            }
        }
  
        return output;
    }

    static copy(nn){
        let ret = new RedeNeural(nn.inputNodes, nn.hiddenNodes1, nn.hiddenNodes2, nn.outputNodes);

        ret.biasIH = new Matrix(ret.hiddenNodes1, 1);

        ret.biasHO = new Matrix(ret.outputNodes, 1);

        ret.biasHH = new Matrix(ret.hiddenNodes2, 1)

        ret.weightIH = new Matrix(ret.hiddenNodes1, ret.inputNodes);

        ret.weightHO = new Matrix(ret.outputNodes, ret.hiddenNodes2);

        ret.weightHH = new Matrix(ret.hiddenNodes2, ret.hiddenNodes1)

        ret.biasIH      = Matrix.add(ret.biasIH, nn.biasIH);
        ret.biasHO      = Matrix.add(ret.biasHO, nn.biasHO);
        ret.biasHH      = Matrix.add(ret.biasHH, nn.biasHH)
        ret.weightIH    = Matrix.add(ret.weightIH, nn.weightIH);
        ret.weightHO    = Matrix.add(ret.weightHO, nn.weightHO);
        ret.weightHH    = Matrix.add(ret.weightHH, nn.weightHH);

        ret.learningRate = nn.learningRate;

        return ret;
    }

    static evolve(nn){
        let newNn = RedeNeural.copy(nn);
        let rate = newNn.learningRate;

        newNn.biasHO.miniRandomize(rate);
        newNn.biasIH.miniRandomize(rate);
        newNn.biasHH.miniRandomize(rate);
        newNn.weightHO.miniRandomize(rate);
        newNn.weightIH.miniRandomize(rate);
        newNn.weightHH.miniRandomize(rate);

        return newNn;
    }

    static mate(nn1, nn2){
        let nn;

        let pseudoNn1 = RedeNeural.copy(nn1);
        let pseudoNn2 = RedeNeural.copy(nn2);

        let rate = nn1.learningRate;

        pseudoNn1.biasHO.miniRandomize(rate);
        pseudoNn1.biasIH.miniRandomize(rate);
        pseudoNn1.biasHH.miniRandomize(rate);
        pseudoNn1.weightHO.miniRandomize(rate);
        pseudoNn1.weightIH.miniRandomize(rate);
        pseudoNn1.weightHH.miniRandomize(rate);

        pseudoNn2.biasHO.miniRandomize(rate);
        pseudoNn2.biasIH.miniRandomize(rate);
        pseudoNn2.biasHH.miniRandomize(rate);
        pseudoNn2.weightHO.miniRandomize(rate);
        pseudoNn2.weightIH.miniRandomize(rate);
        pseudoNn2.weightHH.miniRandomize(rate);

        nn = new RedeNeural(pseudoNn1.inputNodes, pseudoNn1.hiddenNodes1, pseudoNn1.hiddenNodes2, pseudoNn1.outputNodes);

        let nn1Traits = 3;
        let nn2Traits = 3;

        for (let i = 0; i < 6; i++) {
            let dominantTrait = round(random());

            switch (i) {
                case 0:
                    if(nn.biasHO = dominantTrait == 0 && nn1Traits > 0)
                    {
                        nn.biasHO = pseudoNn1.biasHO;
                        nn1Traits--;
                    } 
                    else
                    {
                        nn.biasHO = pseudoNn2.biasHO;
                        nn2Traits--;
                    }
                    
                    break;
                case 1:
                    if(nn.biasIH = dominantTrait == 0 && nn1Traits > 0)
                    {
                        nn.biasIH = pseudoNn1.biasIH;
                        nn1Traits--;
                    } 
                    else
                    {
                        nn.biasIH = pseudoNn2.biasIH;
                        nn2Traits--;
                    }

                    break;
                case 2:
                    if(nn.biasHH = dominantTrait == 0 && nn1Traits > 0)
                    {
                        nn.biasHH = pseudoNn1.biasHH;
                        nn1Traits--;
                    } 
                    else
                    {
                        nn.biasHH = pseudoNn2.biasHH;
                        nn2Traits--;
                    }

                    break;
                case 3:
                    if(nn.weightHO = dominantTrait == 0 && nn1Traits > 0)
                    {
                        nn.weightHO = pseudoNn1.weightHO;
                        nn1Traits--;
                    } 
                    else
                    {
                        nn.weightHO = pseudoNn2.weightHO;
                        nn2Traits--;
                    }

                    break;
                case 4:
                    if(nn.weightIH = dominantTrait == 0 && nn1Traits > 0)
                    {
                        nn.weightIH = pseudoNn1.weightIH;
                        nn1Traits--;
                    } 
                    else
                    {
                        nn.weightIH = pseudoNn2.weightIH;
                        nn2Traits--;
                    }

                    break;
                case 5:
                    if(nn.weightHH = dominantTrait == 0 && nn1Traits > 0)
                    {
                        nn.weightHH = pseudoNn1.weightHH;
                        nn1Traits--;
                    } 
                    else
                    {
                        nn.weightHH = pseudoNn2.weightHH;
                        nn2Traits--;
                    }

                    break;
                default:
                    break;
            }
        }

        return nn;
    }

}

