class Food{
    constructor(id, position, sizeRange, energy){
        this.id = id;
        this.eaten = false;
        this.position = position;
        this.minSize = sizeRange[0];
        this.maxSize = sizeRange[1];
        this.maxEnergy = energy;
        this.energy = energy;

        this.size = map(this.energy, 0, this.maxEnergy, sizeRange[0], sizeRange[1])
    }

    energyChange(amt)
    {
        this.energy += amt;

        if(this.energy > this.maxEnergy)
            this.energy = this.maxEnergy;

        this.size = map(this.energy, 0, this.maxEnergy, this.minSize, this.maxSize);

        if(this.energy <= 0)
        {
            this.energy = 0;
            this.eaten = true;
        }  
    }


    static foodChain(qtd, idIni, width, height, sizeRange, maxEnergy){
        let foodChain = [];

        for (let i = idIni; i < idIni + qtd; i++) {
            let posX = 50 + (Math.random() * (width-50));
            let posY = 50 + (Math.random() * (height-50));
            let pos = createVector(posX, posY);

            let eng = Math.random() * maxEnergy;

            let food = new Food(i, pos, sizeRange, eng);
        
            foodChain.push(food);
        }

        return foodChain;
    }
}