let numPerGeneration = 500;
const maxSpeed = 6;
const rayCount = 9;
const rayLength = 150;
const rayAngle = Math.PI;
let geneticDifference = .1;
let includeOriginal = false;
let trialTime = 1000;

let paused = false;
let bestScore = -10000;
let generation = 0;

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

let traffic, cars, bestCar, i;

setUp();
animate();

function setTraffic() {
    return [
        new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -600, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -600, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -800, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -1000, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1000, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1110, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1200, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -1650, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -1700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -1900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -2000, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -2000, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -2100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -2200, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -2200, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -2300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -2500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -2500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -2700, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -2900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -2900, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -3100, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -3300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -3300, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(1), -3500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(0), -3500, 30, 50, "DUMMY", 2),
        new Car(road.getLaneCenter(2), -3600, 30, 50, "DUMMY", 2),
    ]
}

function findBestCar() {
    return cars.find(c => 
        c.score == Math.max(...cars.map(c => c.score))
    )
}

function killCars() {
    for(let i = 0; i < cars.length; i++) {
        cars[i].damaged = true;
    }
}

function save() {
    killCars();
    bestCar = findBestCar();

    if(bestCar.score >= bestScore) {
        bestScore = bestCar.score;
        console.log("Better Car Found")
        localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    }
}

function pause() {
    paused = !paused;
}

function discard() {
    localStorage.removeItem("bestBrain");
    bestScore = -10000
}

function generateCars(N) {
    const cars = [];
    for(let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", maxSpeed, rayCount, rayLength, rayAngle));
    }

    if(localStorage.getItem("bestBrain")){
        for(let i=0;i<cars.length;i++){
            cars[i].brain=JSON.parse(
                localStorage.getItem("bestBrain"));
            if(!includeOriginal || i != 0){
                NeuralNetwork.mutate(cars[i].brain, geneticDifference);
            }
        }
    }    

    return cars;
}

function setUp() {
    traffic = setTraffic();
    cars = generateCars(numPerGeneration);
    bestCar = cars[0];
    i = 0;
    generation += 1;
}

function animate() {
    if(!paused) {
        for(let i = 0; i < traffic.length; i++) {
            traffic[i].update(road.borders, [])
        }
        for(let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic);
        }

        
        bestCar = cars.find(
            c => c.y == Math.min(
                ...cars.map(c=>c.y)
            )
        )

        carCanvas.height = window.innerHeight;
        networkCanvas.height = window.innerHeight;

        carCtx.save();
        carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

        road.draw(carCtx);

        for(let i = 0; i < traffic.length; i++) {
            traffic[i].draw(carCtx, "red")
        }

        carCtx.globalAlpha = 0.2;
        for(let i = 0; i < cars.length; i++) {
            cars[i].draw(carCtx, "blue");
        }
        carCtx.globalAlpha = 1;
        bestCar.draw(carCtx, "blue", true)


        carCtx.restore();
        i++;

        if(i == trialTime || cars.every(c => c.damaged)) {
            save();
            setUp();
        } 

        Visualizer.drawNetwork(networkCtx, bestCar.brain);
        
    }

    requestAnimationFrame(animate)
}