class Particle {
    constructor(x, y, w, h, fixed) {
        this.x = x;
        this.y = y;
        this.r = r;
        let options = {
            friction: 1,
            restitution: 0.9,
            isStatic: fixed,
            render: {
                sprite: {
                    texture: 'img/college.png', // Replace with your image path
                    xScale: 1, // Scale the image if needed
                    yScale: 1
                }
            }
        }
        this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);
        Composite.add(world, this.body);
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        strokeWeight(1);
        stroke(255)
        fill(127);
        ellipse(0, 0, this.r * 2);
        line(0, 0, this.r, 0);
        pop();
    }
}