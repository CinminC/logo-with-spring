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
        this.widthWithSpacing = 0;
        this.totalWidth = 0;
        this.newWidthWithSpacing = 0;
        this.stillDetect = false
    }

    preloadImages() {
        for (let path of this.imagePaths) {
            this.imageElements.push(loadImage(path));
        }
    }

    initialize(widthWithSpacing) {
        this.widthWithSpacing = widthWithSpacing;
        this.totalWidth = this.calculateTotalWidth();
        this.startX = (width - widthWithSpacing) / 2
        let x = this.startX;
        let spacing = (widthWithSpacing - this.totalWidth) / (this.imageElements.length - 1)

        for (let img of this.imageElements) {
            let imageWidth = img.width * this.imageScale;
            let y = this.startY;
            let rectangle = Bodies.rectangle(x + imageWidth / 2, y, img.width * this.imageScale, img.height * this.imageScale, { restitution: 1, friction: 0.5 });
            this.rect.push(rectangle);
            this.initialPositions.push({ x: rectangle.position.x, y: rectangle.position.y });
            World.add(world, rectangle);
            x += imageWidth + spacing;
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

    calculateWidthWithSpacing() {
        let totalWidth = 0;
        for (let img of this.imageElements) {
            totalWidth += img.width * this.imageScale;
            if (this.imageElements.indexOf(img) < this.imageElements.length - 1) {
                totalWidth += this.imageSpacing;
            }
        }
        return totalWidth;
    }

    calculateTotalWidth() {
        let totalWidth = 0;
        for (let img of this.imageElements) {
            totalWidth += img.width * this.imageScale;
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
        for (let img of this.imageElements) {
            let y = this.startY;
            push();
            fill(20);
            noStroke()
            rect(this.initialPositions[this.imageElements.indexOf(img)].x, y, img.width * this.imageScale, img.height * this.imageScale);
            pop();
        }
    }

    updatePositions() {
        // this.imageSpacing = map(mouseX, 0, width, 10, 80);
        this.newWidthWithSpacing = map(mouseX, 0, width, this.widthWithSpacing, this.widthWithSpacing * 1.5, true);
        let totalWidth = this.calculateTotalWidth();
        this.startX = (width - this.newWidthWithSpacing) / 2
        let xx = this.startX;
        this.imageSpacing = (this.newWidthWithSpacing - totalWidth) / (this.imageElements.length - 1)

        // for (let i = 0; i < this.rect.length; i++) {
        //     let imageWidth = this.imageElements[i].width * this.imageScale;

        //     if (i < this.rect.length - 1) {
        //         Composite.remove(world, this.constraints[i]);
        //     }

        //     this.initialPositions[i].x = xx + imageWidth / 2;
        //     xx += imageWidth + this.imageSpacing;
        // }
        // this.constraints = [];

        // for (let i = 0; i < this.rect.length - 1; i++) {
        //     let options = {
        //         bodyA: this.rect[i],
        //         bodyB: this.rect[i + 1],
        //         length: this.initialPositions[i + 1].x - this.initialPositions[i].x,
        //         stiffness: 0.05
        //     };
        //     let constraint = Constraint.create(options);
        //     this.constraints.push(constraint);
        //     World.add(world, constraint);
        // }
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
                stiffness: stiffness
            };
            let constraint = Constraint.create(options);
            this.constraints.push(constraint);
            World.add(world, constraint);
        }
    }

    getNewWidthWithSpacing() {
        return this.newWidthWithSpacing;
    }

    applyForces() {
        // let forceMagnitude = 0.005
        // let forceMagnitude = map(mouseX, 0, width, 0, force);
        this.stillDetect = true;

        let forceMagnitude = map(mouseX - pmouseX, -width, width, -force, force);
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
    // applyForces() {
    //     let baseForceMagnitude = map(mouseX - pmouseX, -width, width, -force, force);
    //     let midIndex = Math.floor(this.rect.length / 2);

    //     for (let i = 0; i < this.rect.length; i++) {
    //         let distanceToCenter = Math.abs(i - midIndex);

    //         //closer to center, bigger force
    //         let forceScale = 1 - (distanceToCenter / midIndex) * 0.5; // 比例因子，中心位置为1，边缘位置为0.5
    //         let forceMagnitude = baseForceMagnitude * forceScale;

    //         let direction = 0;
    //         if (i < midIndex) {
    //             direction = -forceMagnitude;
    //         } else if (i > midIndex || this.rect.length % 2 === 0) {
    //             direction = forceMagnitude;
    //         }

    //         Body.applyForce(this.rect[i],
    //             { x: this.rect[i].position.x, y: this.rect[i].position.y },
    //             { x: direction, y: 0 }
    //         );
    //     }
    // }


    updateDamping() {
        for (let rectangle of this.rect) {
            Body.setVelocity(rectangle, { x: rectangle.velocity.x * (1 / damping), y: rectangle.velocity.y });
        }
    }

    updateEasing() {
        for (let i = 0; i < this.rect.length; i++) {
            let rectangle = this.rect[i];
            let initialPos = this.initialPositions[i];
            let currPos = rectangle.position;
            let distX = initialPos.x - currPos.x;
            let distY = initialPos.y - currPos.y;
            // let easing = 0.01;

            if (Math.abs(rectangle.velocity.x) < 0.1 && Math.abs(rectangle.velocity.y) < 0.1) {
                rectangle.position.x += distX * textEasing;
                rectangle.position.y += distY * textEasing;
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

    isAlmostStill() {
        let velocityThreshold = 0.1; // 速度阈值
        let accelerationThreshold = 0.0; // 加速度阈值
        // print(Math.sqrt(this.rect[0].force.x ** 2 + this.rect[0].force.y ** 2) / this.rect[0].mass)
        for (let rect of this.rect) {
            let velocity = Math.sqrt(rect.velocity.x ** 2 + rect.velocity.y ** 2);
            let acceleration = Math.sqrt(rect.force.x ** 2 + rect.force.y ** 2) / rect.mass;

            if (acceleration > accelerationThreshold) {
                return false;
            }
        }
        return true;
    }

    updatePositionsWhenStill() {
        if (this.stillDetect == true && this.isAlmostStill()) {
            this.updatePositions();
            this.stillDetect = false;
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
let widthWithSpacing = 0;
let startX = 100

let showDebug = false
let whValue = 400;
let imageManager1, imageManager2;

//logo
let logoWidth = 0;
let logoTargetWidth = 0;
let barX = 0;
let barY = 0;
let barW = 0;
let barH = 0;
let barTargetX = 0;
let isScale = false

//slider
let damping = 1.18;
let textEasing = 0.05;
let logoEasing = 0.1;
let force = 0.01
let stiffness = 0.05

function guiDampingLerp(ratio) {
    damping = ratio
}
function guiTextEasing(ratio) {
    textEasing = ratio
}

function guiLogoEasing(ratio) {
    logoEasing = ratio
}

function guiForce(ratio) {
    force = ratio
}

function guiStiffness(ratio) {
    stiffness = ratio
}

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


    widthWithSpacing = imageManager1.calculateWidthWithSpacing()
    logoWidth = widthWithSpacing
    logoTargetWidth = widthWithSpacing
    imageManager1.initialize(widthWithSpacing);

    imageManager2.updatePosY(8);
    imageManager2.initialize(widthWithSpacing);


    //blue bar
    barX = width / 2;
    barTargetX = width / 2;
    barY = 0;
    barW = 0;
    barH = 0;

    //checkbox
    checkbox = createCheckbox('show target position');
    checkbox.position(250, 10);
    checkbox.style('transform', 'scale(0.5)');
    checkbox.style('font-family', 'Verdana');

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
    background(255);
    Engine.update(engine);
    rectMode(CENTER)
    //hint
    textSize(8);
    textFont('Verdana');
    text('Hint: Drag the blue bar to scale', 10, 20);
    //draw logo
    logoWidth = lerp(logoWidth, logoTargetWidth, logoEasing)

    let logoPosY = height / 2 - 34
    let logoHeight = 40;

    //blue bar
    barX = lerp(barX, barTargetX, logoEasing)
    barY = logoPosY + logoHeight / 8
    barW = logoHeight / 4
    barH = logoHeight * 3 / 4

    push()
    noFill()
    strokeWeight(2)
    strokeCap(SQUARE);
    line(width / 2 - logoWidth / 2, logoPosY - logoHeight / 2, width / 2 - logoWidth / 2, logoPosY + logoHeight / 2)
    line(width / 2 + logoWidth / 2, logoPosY - logoHeight / 2, width / 2 + logoWidth / 2, logoPosY + logoHeight / 2)
    strokeCap(PROJECT);
    line(width / 2 - logoWidth / 2, logoPosY - logoHeight / 2, width / 2 + logoWidth / 2, logoPosY - logoHeight / 2)
    // rect(width / 2, logoPosY, logoWidth, 40)
    noStroke()
    //grey
    fill(178)
    rect(width / 2, logoPosY - 5, logoWidth - 20, 10)
    rect(width / 2, logoPosY + 15, logoWidth - 20, 10)

    //blue
    fill('#033097')
    rect(barX, barY, barW, barH)

    pop()

    if (checkbox.checked()) {
        imageManager1.drawDebug();
        imageManager2.drawDebug();
        line(pmouseX, pmouseY, mouseX, mouseY);
    }

    if (mouseIsPressed) {
        if (mouseX > barX - barW / 2 && mouseX < barX + barW / 2 && mouseY > barY - barH / 2 && mouseY < barY + barH) {
            isScale = true;
        }
    }
    if (isScale) {
        push()
        noStroke()
        fill("#577ED7")
        rect(barX, barY, barW, barH)
        pop()

        imageManager1.applyForces();
        imageManager2.applyForces();
        imageManager1.updatePositions();
        imageManager2.updatePositions();
        widthWithSpacing = imageManager1.getNewWidthWithSpacing()
        logoTargetWidth = widthWithSpacing

        if (mouseX > width / 2 + widthWithSpacing / 2 - barW * 3) {
            barTargetX = width / 2 + widthWithSpacing / 2 - barW * 3
        } else if (mouseX < width / 2 - widthWithSpacing / 2 + barW * 3) {
            barTargetX = width / 2 - widthWithSpacing / 2 + barW * 3
        } else {
            barTargetX = mouseX
        }
        // barTargetX = map(mouseX, 0, width, width / 2 - 50, width / 2 + 50)

    }

    // imageManager1.updatePositionsWhenStill();
    // imageManager2.updatePositionsWhenStill();
    // widthWithSpacing = imageManager1.getNewWidthWithSpacing()
    // if (isScale) {
    //     logoTargetWidth = widthWithSpacing

    //     if (mouseX > width / 2 + widthWithSpacing / 2 - barW * 3) {
    //         barTargetX = width / 2 + widthWithSpacing / 2 - barW * 3
    //     } else if (mouseX < width / 2 - widthWithSpacing / 2 + barW * 3) {
    //         barTargetX = width / 2 - widthWithSpacing / 2 + barW * 3
    //     } else {
    //         barTargetX = mouseX
    //     }

    // }





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

function mouseReleased() {
    isScale = false;
}