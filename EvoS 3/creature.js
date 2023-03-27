class Creature{
    constructor(nn, id, alive, position, color, sizeRange, generation, mating){
        this.nn = nn;
        this.id = id;
        this.alive = alive;
        this.position = position;
        this.color = color;
        this.age = 0;
        this.generation = generation;

        this.gender = mating ? round(random()) : random() < 0.9 ? 2 : round(random());

        this.maxSize = map(this.color[1], 0, 255, sizeRange[0], sizeRange[1]);
        this.minSize = 0.3*this.maxSize;

        //Red:
        this.speed = map(this.color[0], 0, 255, 1, 5);
        this.fertility = map(this.color[0], 0, 255, 0.6, 1);
        this.evasion = map(this.color[0], 0, 255, 0.05, 0.2);

        //Green:
        this.maxEnergy = map(this.color[1], 0, 255, 200, 1000);
        this.power = map(this.color[1], 0, 255, 100, 600);

        this.energy = this.maxEnergy;
        this.size = map(this.energy, 0, this.maxEnergy, this.minSize, this.maxSize);

        //Blue:
        this.sight = map(this.color[2], 0, 255, 100, 1000);
        this.accuracy = map(this.color[2], 0, 255, 0.01, 1);

        this.evolved = map((this.color[0] + this.color[1] + this.color[2]) / 3, 0, 255, 0, 100);

        this.mature = map(this.evolved, 0, 100, 5, 1)
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
            this.alive = false;
        }  
    }

    static creatureChain(qtd, qtdIn, qtdHidden1, qtdHidden2, qtdOut, width, height, sizeRange){
        let creatureChain = [];

        for (let i = 0; i < qtd; i++) {
            let nnAtual = new RedeNeural(qtdIn, qtdHidden1, qtdHidden2, qtdOut);

            let posX = 50 + random() * (width - 100);
            let posY = 50 + random() * (height - 100);
            let pos = createVector(posX, posY);

            let mainClr = floor(random()*3);

            let r, g, b;

            if(mainClr == 0)
            {
                r = random() * 255;
                g = floor(map(random() * 255, 0, 255, 0, 300-r));
                b = 300 - r - g;
            }
            else if(mainClr == 1)
            {
                g = random() * 255;
                b = floor(map(random() * 255, 0, 255, 0, 300-g));
                r = 300 - g - b;
            }
            else
            {
                b = random() * 255;
                r = floor(map(random() * 255, 0, 255, 0, 300-b));
                g = 300 - b - r;
            }

            let clr = [r, g, b]

            let mating = random() > 0.67 ? true : false;

            let creature = new Creature(nnAtual, i, true, pos, clr, sizeRange, 0, mating);
        
            creatureChain.push(creature);
        }

        return creatureChain;
    }

    static Mate(crt1, crt2, offspring, width, height, lastCreature)
    {
        let newCreature;

        let inp = [crt2.energy/crt2.maxEnergy];

        for (let i = 0; i < 3; i++) {
            inp.push(width);
            inp.push(height);
            inp.push(0);
        }

        for (let i = 0; i < 3; i++) {
            if(i == 0)
            {
                inp.push(crt1.position.x - crt2.position.x);
                inp.push(crt1.position.y - crt2.position.y);

                inp.push(crt1.gender - crt2.gender);
            }
            else
            {
                //for (let j = 0; j < 6; j++) {
                    inp.push(width);
                    inp.push(height);
                    inp.push(0);
                    inp.push(width);
                    inp.push(height);
                    inp.push(0);
                //}
            }
        }

        let mating = (crt1.gender == 0 && crt2.gender == 1) || (crt1.gender == 1 && crt2.gender == 0);

        if(!mating)
            return -1;

        let conscent = crt2.nn.predict(inp)[9] <= 0.85;

        if(!conscent)
            return -2;

        let tryNow = random();

        let fertile = crt1.fertility >= tryNow && crt2.fertility >= tryNow;

        if(!fertile)
            return -3;
        
        if(conscent && fertile)
        {
            let newNn = RedeNeural.mate(crt1.nn, crt2.nn);

            let newRed1     = crt1.color[0] + (crt1.color[0] * random() * 0.2 * pow(-1, round(random())));
            let newGreen1   = crt1.color[1] + (crt1.color[1] * random() * 0.2 * pow(-1, round(random())));
            let newBlue1    = crt1.color[2] + (crt1.color[2] * random() * 0.2 * pow(-1, round(random())));

            let newRed2     = crt2.color[0] + (crt2.color[0] * random() * 0.2 * pow(-1, round(random())));
            let newGreen2   = crt2.color[1] + (crt2.color[1] * random() * 0.2 * pow(-1, round(random())));
            let newBlue2    = crt2.color[2] + (crt2.color[2] * random() * 0.2 * pow(-1, round(random())));

            let newRed      = (newRed1 + newRed2)/2;
            if(newRed > 255)
                newRed = 255; 
            
            let newGreen    = (newGreen1 + newGreen2)/2;
            if(newGreen > 255)
                newGreen = 255; 

            let newBlue     = (newBlue1 + newBlue2)/2;
            if(newBlue > 255)
                newBlue = 255; 

            let posX, posY;

            if(crt2.position.x > crt1.position.x)
                posX = crt1.position.x - (crt1.size*1.2);
            else
                posX = crt1.position.x + (crt1.size*1.2);

            if(crt2.position.y > crt1.position.y)
                posY = crt1.position.y - (crt1.size*1.2);
            else
                posY = crt1.position.y + (crt1.size*1.2);

            let newgeneration = crt1.generation > crt2.generation ? crt1.generation + 1 : crt2.generation + 1;

            let newPosition = createVector(posX, posY)

            newCreature = new Creature(newNn, lastCreature, true, newPosition, [newRed, newGreen, newBlue], sizeRange, newgeneration, true);

            newCreature.energy = (0.05 * offspring * crt1.energy) + (0.05 * offspring * crt2.energy);
        }

        crt1.energyChange(- (0.05 * offspring * crt1.energy));

        crt2.energyChange(- (0.05 * offspring * crt2.energy));

        return newCreature;
    }

    static Divide(crt, lastCreature)
    {
        //evolves++;

        let newNn       = RedeNeural.evolve(crt.nn);

        let newRed      = crt.color[0] + (crt.color[0] * random() * 0.2 * pow(-1, round(random())));
        let newGreen    = crt.color[1] + (crt.color[1] * random() * 0.2 * pow(-1, round(random())));
        let newBlue     = crt.color[2] + (crt.color[2] * random() * 0.2 * pow(-1, round(random())));

        if(newRed > 255)
            newRed = 255; 
        
        if(newGreen > 255)
            newGreen = 255; 

        if(newBlue > 255)
            newBlue = 255; 

        let newColor    = [newRed, newGreen, newBlue];

        let posX = crt.position.x + (pow(-1, round(random()))*(crt.size*1.2));
        let posY = crt.position.y + (pow(-1, round(random()))*(crt.size*1.2));

        let pos = createVector(posX, posY);

        let newCreature = new Creature(newNn, lastCreature, true, pos, newColor, sizeRange, crt.generation + 1, false);

        newCreature.energy = crt.energy * 0.4;

        crt.energy = crt.energy * 0.4;

        return newCreature;
    }
}