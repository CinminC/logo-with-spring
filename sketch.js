class ImageManager {
    constructor(imagePaths, startY, imageScale = 0.4, imageSpacing = 20) {
        this.rect = [];
        this.initialPositions = [];
        this.constraints = [];
        this.imageElements = [];
        this.imagePaths = imagePaths;
        this.startX = 0;
        this.startY = startY;
        this.imageScale = imageScale;
        this.imageSpacing = imageSpacing;
    }

    preloadImages() {
        for (let path of this.imagePaths) {
            this.imageElements.push(loadImage(path));
        }
    }

    initialize() {
        let totalWidth = this.calculateTotalWidth();
        this.startX = (width - totalWidth) / 2
        let x = this.startX;

        for (let img of this.imageElements) {
            let imageWidth = img.width * this.imageScale;
            let y = this.startY;
            let rectangle = Bodies.rectangle(x + imageWidth / 2, y, img.width * this.imageScale, img.height * this.imageScale, { restitution: 1, friction: 0.5 });
            this.rect.push(rectangle);
            this.initialPositions.push({ x: rectangle.position.x, y: rectangle.position.y });
            World.add(world, rectangle);
            x += imageWidth + this.imageSpacing;
        }

        this.initializeConstraints();
    }

    initializeConstraints() {
        for (let i = 0; i < this.rect.length - 1; i++) {
            let options = {
                bodyA: this.rect[i],
                bodyB: this.rect[i + 1],
                length: this.rect[i + 1].position.x - this.rect[i].position.x,
                stiffness: 0.1
            };
            let constraint = Constraint.create(options);
            this.constraints.push(constraint);
            World.add(world, constraint);
        }
    }

    calculateTotalWidth() {
        let totalWidth = 0;
        for (let img of this.imageElements) {
            totalWidth += img.width * this.imageScale;
            if (this.imageElements.indexOf(img) < this.imageElements.length - 1) {
                totalWidth += this.imageSpacing;
            }
        }
        return totalWidth;
    }

    updatePosY(spacing) {
        this.startY += this.imageElements[0].height * this.imageScale + spacing;
    }

    drawDebug() {
        for (let constraint of this.constraints) {
            push();
            stroke(0);
            strokeWeight(2);
            line(constraint.bodyA.position.x, constraint.bodyA.position.y, constraint.bodyB.position.x, constraint.bodyB.position.y);
            pop();
        }

        let x = this.startX;
        for (let img of this.imageElements) {
            let imageWidth = img.width * this.imageScale;
            let y = this.startY;
            push();
            fill(20);
            noStroke()
            rect(x + imageWidth / 2, y, img.width * this.imageScale, img.height * this.imageScale);
            pop();
            x += imageWidth + this.imageSpacing;
        }
    }

    updatePositions() {
        this.imageSpacing = map(mouseX, 0, width, 10, 80);

        let totalWidth = this.calculateTotalWidth();
        this.startX = (width - totalWidth) / 2
        let xx = this.startX;

        for (let i = 0; i < this.rect.length; i++) {
            let imageWidth = this.imageElements[i].width * this.imageScale;

            if (i < this.rect.length - 1) {
                Composite.remove(world, this.constraints[i]);
            }

            this.initialPositions[i].x = xx + imageWidth / 2;
            xx += imageWidth + this.imageSpacing;
        }
        this.constraints = [];

        for (let i = 0; i < this.rect.length - 1; i++) {
            let options = {
                bodyA: this.rect[i],
                bodyB: this.rect[i + 1],
                length: this.initialPositions[i + 1].x - this.initialPositions[i].x,
                stiffness: 0.1
            };
            let constraint = Constraint.create(options);
            this.constraints.push(constraint);
            World.add(world, constraint);
        }
    }
    applyForces() {
        let forceMagnitude = map(mouseX, 0, width, 0, force);
        let midIndex = Math.floor(this.rect.length / 2);

        for (let i = 0; i < this.rect.length; i++) {
            let direction = 0;

            if (i < midIndex) {
                direction = -forceMagnitude;
            } else if (i > midIndex || this.rect.length % 2 === 0) {
                direction = forceMagnitude;
            }

            Body.applyForce(this.rect[i], { x: this.rect[i].position.x, y: this.rect[i].position.y }, { x: direction, y: 0 });
        }

        // Body.applyForce(this.rect[0], { x: this.rect[0].position.x, y: this.rect[0].position.y }, { x: -forceMagnitude, y: 0 });
        // Body.applyForce(this.rect[1], { x: this.rect[1].position.x, y: this.rect[1].position.y }, { x: -forceMagnitude, y: 0 });
        // Body.applyForce(this.rect[2], { x: this.rect[2].position.x, y: this.rect[2].position.y }, { x: forceMagnitude, y: 0 });
        // Body.applyForce(this.rect[3], { x: this.rect[3].position.x, y: this.rect[3].position.y }, { x: forceMagnitude, y: 0 });

    }

    updateDamping() {
        for (let rectangle of this.rect) {
            Body.setVelocity(rectangle, { x: rectangle.velocity.x * 0.85, y: rectangle.velocity.y });
        }
    }

    updateEasing() {
        for (let i = 0; i < this.rect.length; i++) {
            let rectangle = this.rect[i];
            let initialPos = this.initialPositions[i];
            let currPos = rectangle.position;
            let distX = initialPos.x - currPos.x;
            let distY = initialPos.y - currPos.y;
            let easing = 0.05;

            if (Math.abs(rectangle.velocity.x) < 0.1 && Math.abs(rectangle.velocity.y) < 0.1) {
                rectangle.position.x += distX * easing;
                rectangle.position.y += distY * easing;
            }
        }
    }

    drawImages() {
        let count = 0;
        for (let rectangle of this.rect) {
            let img = this.imageElements[count];
            imageMode(CENTER);
            image(img, rectangle.position.x, rectangle.position.y, img.width * this.imageScale, img.height * this.imageScale);
            count++;
        }
    }
}

const { Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint, Composite } = Matter;

let engine;
let world;
let texts = [];
let constraints = [];
let mConstraint;
let initialPositions = [];
let images = [];
let images2 = [];
let imagePaths = ['img/college.png', 'img/of.png', 'img/humanities.png', 'img/arts.png']; // 替換成你的圖片路徑
// let imagePaths = ['img/of.png', 'img/of.png', 'img/college.png', 'img/of.png', 'img/humanities.png', 'img/arts.png', 'img/of.png', 'img/of.png']; // 替換成你的圖片路徑
let imagePaths2 = ['img/and.png', 'img/social.png', 'img/sciences.png']; // 替換成你的圖片路徑
let imageScale = 0.4
let imageSpacing = 20;
let startX = 100

let showDebug = false
let force = 0.01
let whValue = 400;
let imageManager1;
function preload() {
    imageManager1 = new ImageManager(imagePaths, whValue / 2);
    imageManager2 = new ImageManager(imagePaths2, whValue / 2);

    imageManager1.preloadImages();
    imageManager2.preloadImages();
}
function setup() {
    createCanvas(whValue, whValue);


    engine = Engine.create();
    world = engine.world;

    //no gravity
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;


    imageManager1.initialize();

    imageManager2.updatePosY(8);
    imageManager2.initialize();

    // mouse drage(maybe dont need)
    let canvasMouse = Mouse.create(canvas.elt);
    let options = {
        mouse: canvasMouse,
    };
    canvasMouse.pixelRatio = pixelDensity();

    // mConstraint = MouseConstraint.create(engine, options);
    // World.add(world, mConstraint);
}

function draw() {
    background(220);
    Engine.update(engine);
    rectMode(CENTER)

    if (showDebug) {
        imageManager1.drawDebug();
        imageManager2.drawDebug();
    }

    if (mouseIsPressed) {
        imageManager1.updatePositions();
        imageManager2.updatePositions();

        imageManager1.applyForces();
        imageManager2.applyForces();
    }

    imageManager1.updateDamping();
    imageManager2.updateDamping();

    imageManager1.updateEasing();
    imageManager2.updateEasing();

    imageManager1.drawImages();
    imageManager2.drawImages();
}


function keyPressed() {
    if (key == ' ') {
        showDebug = !showDebug;
        print('keyPressed')
    }

}

