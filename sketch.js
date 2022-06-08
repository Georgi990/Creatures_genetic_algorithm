// This program is a mini-project for Machine Learning for Media Technology class.
// Upon the start of the program, 2 populations are generated.
// One population is trying to mantain its health by eating stationary food and avoiding
// poison. The other population is trying to chase and eat the first population.
// All members of both populations are losing health at certain rate. Every frame,
// there is a small chance for each member of both pupulations to spawn a copy of itself.
// There is an option to create more characters by clicking left-mouse button or
// right-mouse button.


var vehicles = [];
var food = [];
var poison = [];

var predators = [];

var debug;
var debug1;

var numberOfVehicles = 50;
var numberOfFood = 40;
var numberOfPoisons = 20;

function setup() {
  createCanvas(windowWidth, windowHeight-60); //640, 360

  //Create vehicles:
  for (var i = 0; i < numberOfVehicles; i++) {
    var x = random(width);
    var y = random(height);
    vehicles[i] = new Vehicle(x, y);
  }

  //Create predator:
  for (var i = 0; i < 5; i++) {
    var x = random(width);
    var y = random(height);
    predators[i] = new Predator(x, y);
  }

  //Create food:
  for (var i = 0; i < numberOfFood; i++) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y)); // a vector holds the x and y coordinates
  }

  //Create poisons:
  for (var i = 0; i < numberOfPoisons; i++) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  debug = createCheckbox('Display perceptions and attractions');
  debug1 = createCheckbox('Display number of prey and predators', true);
}

//END OF SETUP -----------------------

//Disable right mouse click browser context menu:
document.oncontextmenu = function() {
    return false;
}

//Create new vehicles and predators on mouse release:
function mouseReleased() {
  if (mouseButton === LEFT) {
    vehicles.push(new Vehicle(mouseX, mouseY));
  }
  if (mouseButton === RIGHT) {
    predators.push(new Predator(mouseX, mouseY));
  }
}

function draw() {
  background(51);

//Measure equilibrium:
  push();
  textStyle(BOLD);
  textSize(40);
  var eqCol = color(255);
  var dif = vehicles.length-predators.length;
  if (dif < 0) {
    dif*=-1;
  }
  var alpha = 0;
  alpha = map(dif,0,20,255,0);
  eqCol.setAlpha(alpha);
  fill(eqCol);
  text('EQUILIBRIUM', width/2 - 130, height - 20);
  pop();

//Display preys and predators if debug1 is checked:
if (debug1.checked()) {
  textSize(32);
  var txt = 'Predators: ' + predators.length;
  fill(0, 170, 255);
  text(txt, width - 200, 35);

  var txt = 'Prey: ' + vehicles.length;
  fill(0, 255, 0);
  text(txt, 10, 35);
}

  //Chance to spawn new food:
  if (random(1) < 0.1) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  //Chance to spawn new poison:
  if (random(1) < 0.01) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  //Draw food:
  for (var i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4, 4);
  }

  //Draw poison:
  for (var i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4, 4);
  }

  //Vehicles:
  for (var i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].boundaries();
    vehicles[i].behaviors(food, poison);
    vehicles[i].update();
    vehicles[i].display();

    //Create a copy of the vehicle if clone is not returning null:
    var newVehicle = vehicles[i].clone();
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    //Kill vehicles if their health goes bellow 0. If a vehicle dies, create grave food:
    if (vehicles[i].dead()) {
      var x = vehicles[i].position.x;
      var y = vehicles[i].position.y;
      food.push(createVector(x, y));
      vehicles.splice(i, 1);
    }
  }

  //Predators:
  for (var i = predators.length - 1; i >= 0; i--) {
    predators[i].boundaries();
    predators[i].behaviors(vehicles);
    predators[i].update();
    predators[i].display();

    //Create a copy of the predator if clone is not returning null:
    var newPredator = predators[i].clone();
    if (newPredator != null) {
      predators.push(newPredator);
    }

    //Kill predators if their health goes bellow 0. If a predator dies, create grave poison:
    if (predators[i].dead()) {
      var x = predators[i].position.x;
      var y = predators[i].position.y;
      poison.push(createVector(x, y));
      predators.splice(i, 1);
    }
  }

}
