/* VARIÁVEIS */
let xCuba = 1500;
let yCuba = 800;
let xCanvas = 1700;
let yCanvas = 900;
let fr = 15; //starting FPS
let creatureList = [];
let neuralList = [];
let qtdIA = 100;
let qtdIn = 19;
let qtdHidden1 = 20;
let qtdHidden2 = 20;
let qtdOut = 10;
let decisao;
let sizeRange = [10, 40];
let foodDists = [];
let creatureDists = [];
let foodSize = [1, 10];
let foodMaxEnergy = 50;
let maxFoodIni = yCuba / 20;
let minFoodIni = yCuba / 40;
let maxFood = maxFoodIni;
let foodSpawn = maxFood / 40;
let lastFood = maxFood - 1;
let lastCreature = qtdIA - 1;
let time = 0;
let alive = qtdIA;
let dead = 0;
let mateTries = 0;
let genderMissMatch = 0;
let infertile = 0;
let notConscent = 0;
let mates = 0;
let divides = 0;
let fights = 0;
let w = 0;
let l = 0;
let d = 0;
let starve = 0;
let evolveLvl = 100;
let mostEvolved, crts;
/* END */

function setup() {
    createCanvas(xCanvas, yCanvas);
    rectMode(CENTER)

    frameRate(fr);

    creatureList = Creature.creatureChain(qtdIA, qtdIn, qtdHidden1, qtdHidden2, qtdOut, xCuba, yCuba, sizeRange)
    foodList = Food.foodChain(maxFood, 0, xCuba, yCuba, foodSize, foodMaxEnergy);
}

function draw() {
    background(255);

    if(foodList.length < maxFood && millis() % 1000)
    {
        let foodQnt = maxFood - foodList.length

        let qnt = foodQnt > foodSpawn ? foodSpawn : foodQnt;
        
        let newFood = Food.foodChain(qnt, lastFood, xCuba,yCuba, foodSize, foodMaxEnergy);

        lastFood += qnt;
        foodList = foodList.concat(newFood);
    }

    alive = 0;
    evolveLvl = 0;

    for (let i = 0; i < creatureList.length; i++) {
        let creatureNow = creatureList[i];

        if(creatureNow.alive)
        {
            alive++;
            evolveLvl += creatureNow.evolved;
            fill(creatureNow.color[0], creatureNow.color[1], creatureNow.color[2]);
            circle(creatureNow.position.x, creatureNow.position.y, creatureNow.size);

            textSize(creatureNow.size/2);
            fill('black');

            if(creatureNow.gender == 0)
                text("M", creatureNow.position.x, creatureNow.position.y);
            else if(creatureNow.gender ==  1)
                text("F", creatureNow.position.x, creatureNow.position.y);
            else
                text("A", creatureNow.position.x, creatureNow.position.y);
    
            input = [creatureNow.energy/creatureNow.maxEnergy];
    
            searchEnvironment(creatureNow, input);
    
            decisao = creatureNow.nn.predict(input);
    
            moveCreature(creatureNow, decisao);  
            
            creatureNow.age += millis() % 1000 ? 1 : 0;
        }
        else
        {
            let index = creatureList.indexOf(creatureNow);

            creatureList.splice(index, 1);

            dead++;
        }
    }

    crts = [...creatureList];
    crts.sort((a, b) => b.evolved - a.evolved)

    mostEvolved = GetByID(creatureList, crts[0].id);

    let mostEvolvedClr = [mostEvolved.color[0], mostEvolved.color[1], mostEvolved.color[2]]
    let strapColor;
    
    if((mostEvolvedClr[0] + mostEvolvedClr[1] + mostEvolvedClr[2]) / 3 < 255/2)
        strapColor = 255;
    else
        strapColor = 0;

    evolveLvl = round(evolveLvl*100/alive)/100;

    textSize(13);
    let txt = "Vivos: " + alive + " Mortos: " + dead;
    txt += "        cruzamentos: " + mateTries + "/" + mates + "/" + genderMissMatch + "/" + notConscent + "/" + infertile + "        Divisões: " + divides;
    txt += "        Lutas: " + fights + "/" + w + "/" + l + "/" + d;
    txt += "        Nvl Med Evol: " + evolveLvl + "        Mais Evoluído: " + mostEvolved.id + "/" + round(mostEvolved.evolved*100)/100;

    maxFood = map(alive, 1, 300, maxFoodIni, minFoodIni)

    fill(strapColor);
    rect(0, yCuba + 50, 2500, 50);

    fill(mostEvolvedClr[0], mostEvolvedClr[1], mostEvolvedClr[2]);
    text(txt, 50, yCuba+50);

    for (let i = 0; i < foodList.length; i++) {
        let foodNow = foodList[i];

        foodNow.position.x += pow(-1, floor(random() * 2)) * random();

        if(foodNow.position.x > xCuba)
            foodNow.position.x = foodNow.size;
        else if(foodNow.position.x < 0)
            foodNow.position.x = xCuba - foodNow.size;

        foodNow.position.y += pow(-1, floor(random() * 2)) * random();

        if(foodNow.position.y > yCuba)
            foodNow.position.y = foodNow.size;
        else if(foodNow.position.y < 0)
            foodNow.position.y = yCuba - foodNow.size;
        
        fill(0);
        circle(foodNow.position.x, foodNow.position.y, foodNow.size);
    }
}

function searchEnvironment(crt, inp)
{
    foodDists = [];

    for (let i = 0; i < foodList.length; i++) {
        let foodNow = foodList[i];
        
        let dist = p5.Vector.dist(foodNow.position, crt.position);

        foodDists.push([foodNow.id, dist]);
    }

    foodDists.sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < 3; i++) {
        let foodNow = foodDists[i];
        
        if(foodNow && foodNow[1] <= crt.sight)
        {
            inp.push(GetByID(foodList, foodNow[0]).position.x - crt.position.x);
            inp.push(GetByID(foodList, foodNow[0]).position.y - crt.position.y);
            inp.push(GetByID(foodList, foodNow[0]).size/foodSize[1]);
        }
        else
        {
            for (let j = 0; j < 3-i; j++) {
                //for (let k = 0; k < 3; k++) {
                    inp.push(xCuba);
                    inp.push(yCuba);
                    inp.push(0);
                //}
            }

            break;
        }
    }

    creatureDists = [];

    for (let i = 0; i < creatureList.length; i++) {
        let creatureNow = creatureList[i];

        if(creatureNow.id == crt.id || creatureNow.alive == false)
            continue;

        let dist = p5.Vector.dist(creatureNow.position, crt.position);

        creatureDists.push([creatureNow.id, dist]);
    }

    creatureDists.sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < 3; i++) {
        let creatureNow = creatureDists[i];
        
        if(creatureNow && creatureNow[1] <= crt.sight)
        {
            inp.push(GetByID(creatureList, creatureNow[0]).position.x - crt.position.x);
            inp.push(GetByID(creatureList, creatureNow[0]).position.y - crt.position.y);

            inp.push(GetByID(creatureList, creatureNow[0]).gender - crt.gender);
        }
        else
        {
            for (let j = 0; j < 3-i; j++) {
                //for (let k = 0; k < 6; k++) {
                    inp.push(xCuba);
                    inp.push(yCuba);
                    inp.push(0);
                //}
            }

            break;
        }
    }
}

function moveCreature(crt, dcs)
{
    let moved = false;

    for (let j = 0; j < 8; j++) {
        if (dcs[j] == 1) {
          if (j < 2 || j > 6) {
            crt.position.x += crt.speed;
          }

          if (j > 2 && j < 6) {
            crt.position.x -= crt.speed;
          }

          if (j > 4) {
            crt.position.y += crt.speed;
          }

          if (j > 0 && j < 4) {
            crt.position.y -= crt.speed;
          }

          moved = true;
        }
    }

    let deltaEnergy = map(crt.color[0], 0, 255, crt.maxEnergy*0.00000001 , crt.maxEnergy*0.0007);

    if(moved)
        crt.energyChange(-deltaEnergy);
    else
        crt.energyChange(-deltaEnergy*0.8);

    if(crt.position.x > xCuba) {
        crt.position.x = crt.size;
    }
    if(crt.position.x < 0) {
        crt.position.x = xCuba - crt.size;
    }
    if(crt.position.y > yCuba) {
        crt.position.y = crt.size;
    }
    if(crt.position.y < 0) {
        crt.position.y = yCuba - crt.size;
    }

    let foundFood = foodDists.length > 0 && p5.Vector.dist(crt.position, GetByID(foodList, foodDists[0][0]).position) < (GetByID(foodList, foodDists[0][0]).size + crt.size)/2;
    let foundCreature = creatureDists.length > 0 && p5.Vector.dist(crt.position, GetByID(creatureList, creatureDists[0][0]).position) < (GetByID(creatureList, creatureDists[0][0]).size + crt.size)/2;

    if((foundFood && !foundCreature) || (foundFood && foundCreature && dcs[8] < 0.3))
    {
        const index = foodList.indexOf(GetByID(foodList, foodDists[0][0]));

        let bite = crt.power >= foodList[index].energy ? foodList[index].energy : crt.power;

        let energyGain = map(bite, foodSize[0], foodSize[1], 0, crt.maxEnergy/2);

        if(energyGain > crt.maxEnergy - crt.energy)
            bite = bite * (crt.maxEnergy - crt.energy) / energyGain

        energyGain = map(bite, foodSize[0], foodSize[1], 0, crt.maxEnergy/2);

        crt.energyChange(energyGain);

        foodList[index].energyChange(-bite);

        if(foodList[index].eaten)
            foodList.splice(index, 1);
    }
    else if(foundCreature && dcs[8] > 0.2)
    {
        let creatureFound = GetByID(creatureList, creatureDists[0][0]);

        if(dcs[9] > 0.8)
        {
            Fight(crt, creatureFound);
        }
        else if(crt.age >= crt.mature && creatureFound.age >= creatureFound.mature && crt.gender < 2 && creatureFound.gender < 2 && crt.energy >= 0.5 * crt.maxEnergy && creatureFound.energy >= 0.5 * creatureFound.maxEnergy)
        {
            let qtdMate = 5*round(random());

            for(i = 0; i < qtdMate; i++)
                Mate(crt, creatureFound);
        }
    }
    else if(crt.gender == 2 && dcs[9] <= 0.5 && crt.age >= crt.mature && crt.energy >= 0.8 * crt.maxEnergy)
    {
        Divide(crt);
    }
}

function GetByID(vet, id)
{
    let ret;

    for (let i = 0; i < vet.length; i++) {
        let element = vet[i];
        
        if(element.id == id)
        {
            ret = element;
            break;
        }
    }

    return ret;
}

function Fight(crt1, crt2)
{
    fights++;

    let hit = random();

    let deltaEnergy = crt1.accuracy - crt2.evasion >= hit ? crt1.power : 0;

    if(deltaEnergy > crt2.energy)
        deltaEnergy = crt2.energy;

    crt2.energyChange(- deltaEnergy) 

    crt1.energyChange(deltaEnergy * 0.8);

    if(crt2.alive == true)
    {
        hit = random();

        deltaEnergy =  crt2.accuracy - crt1.evasion >= hit ? crt2.power * 0.2 : 0;

        if(deltaEnergy > crt1.energy)
            deltaEnergy = crt1.energy;

        crt1.energyChange(- deltaEnergy);

        if(crt1.alive)
            d++;
        else
            l++;

        crt2.energyChange(deltaEnergy * 0.8);
    }
    else
        w++;
}

function Mate(crt1, crt2)
{
    mateTries++;

    let mate = Creature.Mate(crt1, crt2, xCuba, yCuba, lastCreature);

    if(mate == -1)
        genderMissMatch++;
    else if(mate == -2)
        notConscent++;
    else if(mate == -3)
        infertile++;
    else
    {
        mates++;

        lastCreature++;

        creatureList.push(mate);
    }
}

function Divide(crt)
{
    divides++;

    let newCreature = Creature.Divide(crt, lastCreature);

    lastCreature++;

    creatureList.push(newCreature);
}
