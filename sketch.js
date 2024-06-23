const { Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint } = Matter;

let engine;
let world;
let circles = [];
let constraints = [];
let mConstraint;
let initialPositions = []; // 用來保存初始位置

function setup() {
    createCanvas(800, 800);

    // 創建一個引擎和世界
    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = 0; // 禁止重力影響 Y 方向的運動

    // 創建四個圓形物體，位置固定在畫布的四分之一和四分之三處
    for (let i = 0; i < 4; i++) {
        let x = 200 + i * 100;
        let y = height / 2;
        let circle = Bodies.circle(x, y, 20, { restitution: 1, friction: 0.5 });
        circles.push(circle);
        initialPositions.push({ x: circle.position.x, y: circle.position.y }); // 儲存初始位置
        World.add(world, circle);
    }

    // 將圓形物體兩兩連接
    for (let i = 0; i < circles.length - 1; i++) {
        let options = {
            bodyA: circles[i],
            bodyB: circles[i + 1],
            length: 100,
            stiffness: 0.1
        };
        let constraint = Constraint.create(options);
        constraints.push(constraint);
        World.add(world, constraint);
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

    for (let i of initialPositions) {
        push()
        fill(20)
        ellipse(i.x, i.y, 40)
        pop()
    }
    // 根據 mouseX 計算應用的力
    if (mouseIsPressed) {
        let forceMagnitude = map(mouseX, 0, width, 0, 0.1);
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



    // 繪製圓形物體
    for (let circle of circles) {
        fill(255);
        stroke(0);
        strokeWeight(1);
        ellipse(circle.position.x, circle.position.y, circle.circleRadius * 2);
    }

    // 繪製連接線（約束）
    for (let constraint of constraints) {
        stroke(0);
        strokeWeight(2);
        line(constraint.bodyA.position.x, constraint.bodyA.position.y, constraint.bodyB.position.x, constraint.bodyB.position.y);
    }

    // 繪製鼠標拖動的約束線
    if (mConstraint.body) {
        let pos = mConstraint.body.position;
        let offset = mConstraint.constraint.pointB;
        let m = mConstraint.mouse.position;
        stroke(0, 255, 0);
        line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
    }
    // print(initialPositions[0])
    // print(circles[0].position)
}
