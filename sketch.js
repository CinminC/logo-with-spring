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
        Body.applyForce(this.rect[0], { x: this.rect[0].position.x, y: this.rect[0].position.y }, { x: -forceMagnitude, y: 0 });
        Body.applyForce(this.rect[1], { x: this.rect[1].position.x, y: this.rect[1].position.y }, { x: -forceMagnitude, y: 0 });
        Body.applyForce(this.rect[2], { x: this.rect[2].position.x, y: this.rect[2].position.y }, { x: forceMagnitude, y: 0 });
        Body.applyForce(this.rect[3], { x: this.rect[3].position.x, y: this.rect[3].position.y }, { x: forceMagnitude, y: 0 });
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
    // for (let i = 0; i < imagePaths.length; i++) {
    //     images[i] = loadImage(imagePaths[i]);
    // }
    // for (let i = 0; i < imagePaths2.length; i++) {
    //     images2[i] = loadImage(imagePaths2[i]);
    // }

    imageManager1 = new ImageManager(['img/college.png', 'img/of.png', 'img/humanities.png', 'img/arts.png'], whValue / 2);

    imageManager1.preloadImages();
}
function setup() {
    createCanvas(whValue, whValue);


    engine = Engine.create();
    world = engine.world;

    //no gravity
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;


    imageManager1.initialize();
    // //init p
    // let totalWidth = calculateTotalWidth(images)
    // startX = (width - totalWidth) / 2
    // let x = startX
    // for (let i = 0; i < imagePaths.length; i++) {
    //     let imageWidth = images[i].width * imageScale;
    //     let y = height / 2;
    //     let circle = Bodies.rectangle(x + imageWidth / 2, y, images[i].width * imageScale, images[i].height * imageScale, { restitution: 1, friction: 0.5 });
    //     texts.push(circle);
    //     initialPositions.push({ x: circle.position.x, y: circle.position.y }); // save init position
    //     World.add(world, circle);
    //     print(totalWidth)
    //     print(x + imageWidth / 2)
    //     x += imageWidth + imageSpacing;
    // }

    // //set up constraints
    // for (let i = 0; i < texts.length - 1; i++) {
    //     let options = {
    //         bodyA: texts[i],
    //         bodyB: texts[i + 1],
    //         length: texts[i + 1].position.x - texts[i].position.x,
    //         stiffness: 0.1
    //     };
    //     let constraint = Constraint.create(options);
    //     constraints.push(constraint);
    //     World.add(world, constraint);
    // }


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

    // if (showDebug) {
    //     // draw constraints
    //     for (let constraint of constraints) {
    //         push()
    //         stroke(0);
    //         strokeWeight(2);
    //         line(constraint.bodyA.position.x, constraint.bodyA.position.y, constraint.bodyB.position.x, constraint.bodyB.position.y);
    //         pop()
    //     }

    //     let x = startX
    //     for (let i = 0; i < 4; i++) {
    //         let imageWidth = images[i].width * imageScale;
    //         let y = height / 2;
    //         push()
    //         fill(20)
    //         rect(x + imageWidth / 2, y, images[i].width * imageScale, images[i].height * imageScale);
    //         pop()
    //         x += imageWidth / 2 + imageSpacing + imageWidth / 2;
    //     }
    //     // 繪製鼠標拖動的約束線
    //     // if (mConstraint.body) {
    //     //     let pos = mConstraint.body.position;
    //     //     let offset = mConstraint.constraint.pointB;
    //     //     let m = mConstraint.mouse.position;
    //     //     stroke(0, 255, 0);
    //     //     line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
    //     // }
    // }


    // // calculate new pos, set new constraints
    // if (mouseIsPressed) {
    //     imageSpacing = map(mouseX, 0, width, 10, 80)

    //     let totalWidth = calculateTotalWidth(images)
    //     startX = (width - totalWidth) / 2
    //     let xx = startX
    //     for (let i = 0; i < texts.length; i++) {
    //         let imageWidth = images[i].width * imageScale;

    //         if (i < texts.length - 1) {
    //             Composite.remove(world, constraints[i]);
    //         }

    //         initialPositions[i].x = xx + imageWidth / 2
    //         xx += imageWidth + imageSpacing;

    //     }
    //     constraints = []

    //     for (let i = 0; i < texts.length - 1; i++) {
    //         let options = {
    //             bodyA: texts[i],
    //             bodyB: texts[i + 1],
    //             length: initialPositions[i + 1].x - initialPositions[i].x,
    //             stiffness: 0.1
    //         };
    //         let constraint = Constraint.create(options);
    //         constraints.push(constraint);
    //         World.add(world, constraint);
    //     }

    //     //apply force
    //     let forceMagnitude = map(mouseX, 0, width, 0, force);
    //     Body.applyForce(texts[0], { x: texts[0].position.x, y: texts[0].position.y }, { x: -forceMagnitude, y: 0 });
    //     Body.applyForce(texts[1], { x: texts[1].position.x, y: texts[1].position.y }, { x: -forceMagnitude, y: 0 });
    //     Body.applyForce(texts[2], { x: texts[2].position.x, y: texts[2].position.y }, { x: forceMagnitude, y: 0 });
    //     Body.applyForce(texts[3], { x: texts[3].position.x, y: texts[3].position.y }, { x: forceMagnitude, y: 0 });

    // }

    // // 設置阻尼使物體逐漸減速回到原位
    // for (let circle of texts) {
    //     Body.setVelocity(circle, { x: circle.velocity.x * 0.85, y: circle.velocity.y }); // 這裡的 0.9 是阻尼因子，控制減速的快慢
    // }

    // // 逐漸回到初始位置的運動
    // for (let i = 0; i < texts.length; i++) {
    //     let circle = texts[i];
    //     let initialPos = initialPositions[i];
    //     let currPos = circle.position;
    //     let distX = initialPos.x - currPos.x;
    //     let distY = initialPos.y - currPos.y;
    //     let easing = 0.05; // 調整回到原位的速度
    //     if (Math.abs(circle.velocity.x) < 0.1 && Math.abs(circle.velocity.y) < 0.1) {
    //         circle.position.x += distX * easing;
    //         circle.position.y += distY * easing;
    //     }
    // }


    // let count = 0;
    // for (let circle of texts) {
    //     fill(255);
    //     // stroke(0);
    //     // strokeWeight(1);
    //     rectMode(CENTER)
    //     imageMode(CENTER)
    //     let imgTemp = images[count]
    //     image(imgTemp, circle.position.x, circle.position.y, imgTemp.width * imageScale, imgTemp.height * imageScale);
    //     // rect(circle.position.x, circle.position.y, circle.bounds.max.x - circle.bounds.min.x, circle.bounds.max.y - circle.bounds.min.y);
    //     count++
    // }



    if (showDebug) {
        imageManager1.drawDebug();
    }

    if (mouseIsPressed) {
        imageManager1.updatePositions();

        imageManager1.applyForces();
    }

    imageManager1.updateDamping();

    imageManager1.updateEasing();

    imageManager1.drawImages();
}


function keyPressed() {
    if (key == ' ') {
        showDebug = !showDebug;
        print('keyPressed')
    }

}

function calculateTotalWidth(images) {
    let totalWidth = 0;
    for (let i = 0; i < images.length; i++) {
        totalWidth += images[i].width * imageScale;
        if (i < images.length - 1) {
            totalWidth += imageSpacing;
        }
    }
    return totalWidth;
}

