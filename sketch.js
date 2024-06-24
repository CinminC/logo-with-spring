const { Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint } = Matter;

let engine;
let world;
let circles = [];
let constraints = [];
let mConstraint;
let initialPositions = []; // 用來保存初始位置

let images = [];
let imagePaths = ['img/college.png', 'img/of.png', 'img/humanities.png', 'img/arts.png', 'img/and.png', 'img/social.png', 'img/sciences.png']; // 替換成你的圖片路徑
let imageScale = 0.4
let imageSpacing = 20;
let startX = 100

let showDebug = false
let force = 0.01
function preload() {
    for (let i = 0; i < imagePaths.length; i++) {
        images[i] = loadImage(imagePaths[i]);
    }
}
function setup() {
    createCanvas(400, 400);

    // 創建一個引擎和世界
    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = 0; // 禁止重力影響 Y 方向的運動

    // 創建四個圓形物體，位置固定在畫布的四分之一和四分之三處
    let x = startX
    for (let i = 0; i < 4; i++) {
        let imageWidth = images[i].width * imageScale;
        let y = height / 2;
        let circle = Bodies.rectangle(x + imageWidth / 2, y, images[i].width * imageScale, images[i].height * imageScale, { restitution: 1, friction: 0.5 });
        circles.push(circle);
        initialPositions.push({ x: circle.position.x, y: circle.position.y }); // 儲存初始位置
        World.add(world, circle);
        x += imageWidth / 2 + imageSpacing + imageWidth / 2;
    }

    // 將圓形物體兩兩連接
    for (let i = 0; i < circles.length - 1; i++) {
        let options = {
            bodyA: circles[i],
            bodyB: circles[i + 1],
            length: circles[i + 1].position.x - circles[i].position.x,
            stiffness: 0.1
        };
        let constraint = Constraint.create(options);
        constraints.push(constraint);
        World.add(world, constraint);
        print(circles[i + 1].position.x - circles[i].position.x)
    }

    // 設置鼠標拖動約束
    let canvasMouse = Mouse.create(canvas.elt);
    let options = {
        mouse: canvasMouse,
    };
    canvasMouse.pixelRatio = pixelDensity();

    mConstraint = MouseConstraint.create(engine, options);
    World.add(world, mConstraint);
}

function draw() {
    background(220);
    Engine.update(engine);
    rectMode(CENTER)

    if (showDebug) {
        // 繪製連接線（約束）
        for (let constraint of constraints) {
            push()
            stroke(0);
            strokeWeight(2);
            line(constraint.bodyA.position.x, constraint.bodyA.position.y, constraint.bodyB.position.x, constraint.bodyB.position.y);
            pop()
        }

        let x = startX
        for (let i = 0; i < 4; i++) {
            let imageWidth = images[i].width * imageScale;
            let y = height / 2;
            push()
            fill(20)
            rect(x + imageWidth / 2, y, images[i].width * imageScale, images[i].height * imageScale);
            pop()
            x += imageWidth / 2 + imageSpacing + imageWidth / 2;
        }
        // 繪製鼠標拖動的約束線
        // if (mConstraint.body) {
        //     let pos = mConstraint.body.position;
        //     let offset = mConstraint.constraint.pointB;
        //     let m = mConstraint.mouse.position;
        //     stroke(0, 255, 0);
        //     line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
        // }
    }


    // 根據 mouseX 計算應用的力
    if (mouseIsPressed) {
        let forceMagnitude = map(mouseX, 0, width, 0, force);
        Body.applyForce(circles[0], { x: circles[0].position.x, y: circles[0].position.y }, { x: -forceMagnitude, y: 0 });
        Body.applyForce(circles[1], { x: circles[1].position.x, y: circles[1].position.y }, { x: -forceMagnitude, y: 0 });
        Body.applyForce(circles[2], { x: circles[2].position.x, y: circles[2].position.y }, { x: forceMagnitude, y: 0 });
        Body.applyForce(circles[3], { x: circles[3].position.x, y: circles[3].position.y }, { x: forceMagnitude, y: 0 });

    }

    // 設置阻尼使物體逐漸減速回到原位
    for (let circle of circles) {
        Body.setVelocity(circle, { x: circle.velocity.x * 0.85, y: circle.velocity.y }); // 這裡的 0.9 是阻尼因子，控制減速的快慢
    }

    // 逐漸回到初始位置的運動
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let initialPos = initialPositions[i];
        let currPos = circle.position;
        let distX = initialPos.x - currPos.x;
        let distY = initialPos.y - currPos.y;
        let easing = 0.05; // 調整回到原位的速度
        if (Math.abs(circle.velocity.x) < 0.1 && Math.abs(circle.velocity.y) < 0.1) {
            circle.position.x += distX * easing;
            circle.position.y += distY * easing;
        }
    }


    let count = 0;
    for (let circle of circles) {
        fill(255);
        // stroke(0);
        // strokeWeight(1);
        rectMode(CENTER)
        imageMode(CENTER)
        let imgTemp = images[count]
        image(imgTemp, circle.position.x, circle.position.y, imgTemp.width * imageScale, imgTemp.height * imageScale);
        // rect(circle.position.x, circle.position.y, circle.bounds.max.x - circle.bounds.min.x, circle.bounds.max.y - circle.bounds.min.y);
        count++
    }


}


function keyPressed() {
    if (key == ' ') {
        showDebug = !showDebug;
        print('keyPressed')
    }

}