// Script for Predator population


var mr = 0.01; //mutation rate

function Predator(x, y, dna) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, -2);
  this.position = createVector(x, y);
  this.r = 5;
  this.maxSize = 5;
  this.minSize = 1;
  this.maxforce = 0.5;
  this.health = 3; //initial health

  // Evolution - assigning of genes to members of population
  this.dna = [];
  if (dna === undefined) {
    this.dna[0] = random(0,3); //attraction to the vehicles
    this.dna[1] = random(0,200); //perception of vehicles
    this.dna[2] = random(2,6); //speed
  } else {
    //Reproduction and mutation
    this.dna[0] = dna[0];
    if (random(1) < mr) {
      this.dna[0] += random(-0.1, 0.1);
    }
    this.dna[1] = dna[1];
    if (random(1) < mr) {
      this.dna[1] += random(-10, 10);
    }
    this.dna[2] = dna[2];
    if (random(1) < mr) {
      this.dna[2] += random(-1, 1);
    }
  }
  this.maxspeed = this.dna[2];

  // Method to update location
  this.update = function() {

    this.health -= 0.003; //health decays over time

    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  };

  this.applyForce = function(force) {
    this.acceleration.add(force);
  };

  // Assign behaviour to population members
  this.behaviors = function(good){
    var steerG = this.eat(good, 0.1, this.dna[1]);

    steerG.mult(this.dna[0]);
    this.applyForce(steerG);
  }

  // Small chance of spawning a clone of itself. Reproduction
  this.clone = function(){
    if (random(1) < 0.001) {
      return new Predator(this.position.x, this.position.y, this.dna);
    } else {
      return null;
    }
  }

    // Eat member of the other population
    this.eat = function(list, nutrition, perception){
      var record = Infinity;
      var closest = null;
      for (var i = list.length - 1; i >= 0; i--) {
        var d = this.position.dist(list[i].position);

        if (d < this.maxspeed) { //Allow to be able to eat stuff even if they are not seen
          list.splice(i,1);
          this.health += nutrition;
        } else{
          if (d < record && d < perception) { //stuff can be seen only if they're smaller than the perception radius
            record = d;
            closest = list[i];
          }
        }
      }

      if (closest != null){
        return this.seek(closest);
      }
      return createVector(0, 0);
    }

    // Search for targets to eat
    this.seek = function(target) {
      var desired = p5.Vector.sub(target.position, this.position); // A vector pointing from the location to the target

      // Scale to maximum speed
      desired.setMag(this.maxspeed);

      // Steering = Desired minus velocity
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce); // Limit to maximum steering force

      return steer;
    };

    //A predator dies if its health goes bellow 0:
    this.dead = function() {
      return this.health < 0;
    };

    this.display = function() {
      // Draw a triangle rotated in the direction of velocity
      var angle = this.velocity.heading() + PI / 2;

      push();
      translate(this.position.x, this.position.y);
      rotate(angle);

      //Debug functionality:
      if (debug.checked()) {
        strokeWeight(3);
      var blue = color(0, 170, 255);
      stroke(blue);
      noFill();
      line(0, 0, 0, -this.dna[0] * 25);
        strokeWeight(2);
      ellipse(0, 0, this.dna[1] * 2); //show the diameter of the perception field
      }

      // Change color of predators depending on health:
      var purple = color(200, 0, 250);
      var blue = color(0, 170, 255);
      var col = lerpColor(purple, blue, this.health);
      this.r = lerp(this.minSize, this.maxSize, this.health);

      //Draw predators:
      fill(col);
      stroke(col);
      strokeWeight(1);
      beginShape();
      vertex(0, -this.r * 2);
      vertex(-this.r, this.r * 2);
      vertex(this.r, this.r * 2);
      endShape(CLOSE);
      pop();
    }

    //Keeping all predators within the window frame:
    this.boundaries = function() {
      var d = 25;

      var desired = null;

      if (this.position.x < d) {
        desired = createVector(this.maxspeed, this.velocity.y);
      } else if (this.position.x > width - d) {
        desired = createVector(-this.maxspeed, this.velocity.y);
      }

      if (this.position.y < d) {
        desired = createVector(this.velocity.x, this.maxspeed);
      } else if (this.position.y > height - d) {
        desired = createVector(this.velocity.x, -this.maxspeed);
      }

      if (desired !== null) {
        desired.normalize();
        desired.mult(this.maxspeed);
        var steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        this.applyForce(steer);
      }
    };

  }
