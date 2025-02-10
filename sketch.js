//slider
let damping = 1.18;
let textEasing = 0.05;
let logoEasing = 0.1;
let force = 0.01;
let stiffness = 0.05;
let isShowPos = false;
function guiDampingLerp(ratio) {
  damping = ratio;
}
function guiTextEasing(ratio) {
  textEasing = ratio;
}

function guiLogoEasing(ratio) {
  logoEasing = ratio;
}

function guiForce(ratio) {
  force = ratio;
}

function guiStiffness(ratio) {
  stiffness = ratio;
}

function guiShowPos(s) {
  isShowPos = s;
}

let GLOBAL = {
  size: {
    width: 400,
    height: 400,
    ratioFixed: true,
  },
  pixelDensity: 4,
};
const sketch = (p) => {
  class ImageManager {
    constructor(imagePaths, startY, imageScale = 0.1, imageSpacing = 20) {
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
      this.stillDetect = false;
    }

    preloadImages() {
      for (let path of this.imagePaths) {
        this.imageElements.push(p.loadImage(path));
      }
    }

    initialize(widthWithSpacing) {
      this.widthWithSpacing = widthWithSpacing;
      this.totalWidth = this.calculateTotalWidth();
      this.startX = (p.width - widthWithSpacing) / 2;
      let x = this.startX;
      let spacing =
        (widthWithSpacing - this.totalWidth) / (this.imageElements.length - 1);
      this.imageSpacing = spacing;
      for (let img of this.imageElements) {
        let imageWidth = img.width * this.imageScale;
        let y = this.startY;
        let rectangle = Bodies.rectangle(
          x + imageWidth / 2,
          y,
          img.width * this.imageScale,
          img.height * this.imageScale,
          { restitution: 1, friction: 0.5 }
        );
        this.rect.push(rectangle);
        this.initialPositions.push({
          x: rectangle.position.x,
          y: rectangle.position.y,
        });
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
          stiffness: 0.1,
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
        p.push();
        p.stroke(50, 200);
        p.strokeWeight(2);
        p.line(
          constraint.bodyA.position.x,
          constraint.bodyA.position.y,
          constraint.bodyB.position.x,
          constraint.bodyB.position.y
        );
        p.pop();
      }
      for (let img of this.imageElements) {
        let y = this.startY;
        p.push();
        p.fill(50, 200);
        p.noStroke();
        p.rect(
          this.initialPositions[this.imageElements.indexOf(img)].x,
          y,
          img.width * this.imageScale,
          img.height * this.imageScale
        );
        p.pop();
      }
    }

    updatePositions() {
      // this.imageSpacing = map(mouseX, 0, width, 10, 80);
      this.newWidthWithSpacing = p.map(
        p.abs(p.mouseX - p.width / 2),
        0,
        p.width / 2,
        this.widthWithSpacing,
        this.widthWithSpacing * 1.8,
        true
      );

      let totalWidth = this.calculateTotalWidth();
      this.startX = (p.width - this.newWidthWithSpacing) / 2;
      let xx = this.startX;
      this.imageSpacing =
        (this.newWidthWithSpacing - totalWidth) /
        (this.imageElements.length - 1);

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
        //   this.initialPositions[i].y = mouseY;
        xx += imageWidth + this.imageSpacing;
      }
      this.constraints = [];

      for (let i = 0; i < this.rect.length - 1; i++) {
        let options = {
          bodyA: this.rect[i],
          bodyB: this.rect[i + 1],
          length: this.initialPositions[i + 1].x - this.initialPositions[i].x,
          stiffness: stiffness,
        };
        let constraint = Constraint.create(options);
        this.constraints.push(constraint);
        World.add(world, constraint);
      }
    }

    updateInnerPositions1() {
      let newSpacingScale = p.map(
        p.mouseX,
        p.width / 2,
        p.width,
        1,
        0.35,
        true
      );
      let xx = this.startX;
      for (let i = 0; i < this.rect.length; i++) {
        let imageWidth = this.imageElements[i].width * this.imageScale;

        if (i < this.rect.length - 1) {
          Composite.remove(world, this.constraints[i]);
        }

        this.initialPositions[i].x = xx + imageWidth / 2;

        if (i == 0) {
          xx += imageWidth + this.imageSpacing * (3 - newSpacingScale * 2);
        } else {
          xx += imageWidth + this.imageSpacing * newSpacingScale;
        }
      }

      this.constraints = [];

      for (let i = 0; i < this.rect.length - 1; i++) {
        let options = {
          bodyA: this.rect[i],
          bodyB: this.rect[i + 1],
          length: this.initialPositions[i + 1].x - this.initialPositions[i].x,
          stiffness: stiffness,
        };
        let constraint = Constraint.create(options);
        this.constraints.push(constraint);
        World.add(world, constraint);
      }
    }

    updateInnerPositions2() {
      let newSpacingScale = p.map(p.mouseX, 0, p.width / 2, 0.3, 1, true);
      let xx = this.startX;
      for (let i = 0; i < this.rect.length; i++) {
        let imageWidth = this.imageElements[i].width * this.imageScale;

        if (i < this.rect.length - 1) {
          Composite.remove(world, this.constraints[i]);
        }

        this.initialPositions[i].x = xx + imageWidth / 2;

        if (i == 0) {
          xx += imageWidth + this.imageSpacing * newSpacingScale;
        } else {
          xx += imageWidth + this.imageSpacing * (2 - newSpacingScale);
        }
      }

      // for (let i = 0; i < this.rect.length; i++) {
      //   let imageWidth = this.imageElements[i].width * this.imageScale;

      //   if (i < this.rect.length - 1) {
      //     Composite.remove(world, this.constraints[i]);
      //   }

      //   this.initialPositions[i].x = xx + imageWidth / 2;
      //   xx += imageWidth + this.imageSpacing;
      // }

      this.constraints = [];

      for (let i = 0; i < this.rect.length - 1; i++) {
        let options = {
          bodyA: this.rect[i],
          bodyB: this.rect[i + 1],
          length: this.initialPositions[i + 1].x - this.initialPositions[i].x,
          stiffness: stiffness,
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

      let forceMagnitude = p.map(
        p.mouseX - p.pmouseX,
        -p.width,
        p.width,
        -force,
        force
      );
      let midIndex = Math.floor(this.rect.length / 2);

      for (let i = 0; i < this.rect.length; i++) {
        let direction = 0;

        if (i < midIndex) {
          direction = -forceMagnitude;
        } else if (i > midIndex || this.rect.length % 2 === 0) {
          direction = forceMagnitude;
        }

        Body.applyForce(
          this.rect[i],
          { x: this.rect[i].position.x, y: this.rect[i].position.y },
          { x: direction, y: 0 }
        );
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
        Body.setVelocity(rectangle, {
          x: rectangle.velocity.x * (1 / damping),
          y: rectangle.velocity.y * (1 / damping),
        });
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

        if (
          Math.abs(rectangle.velocity.x) < 0.1 &&
          Math.abs(rectangle.velocity.y) < 0.1
        ) {
          rectangle.position.x += distX * textEasing;
          rectangle.position.y += distY * textEasing;
        }
      }
    }

    drawImages() {
      let count = 0;
      for (let rectangle of this.rect) {
        let img = this.imageElements[count];
        p.imageMode(p.CENTER);
        p.image(
          img,
          rectangle.position.x,
          rectangle.position.y,
          img.width * this.imageScale,
          img.height * this.imageScale
        );
        count++;
      }
    }

    isAlmostStill() {
      let velocityThreshold = 0.1; // 速度阈值
      let accelerationThreshold = 0.0; // 加速度阈值
      // print(Math.sqrt(this.rect[0].force.x ** 2 + this.rect[0].force.y ** 2) / this.rect[0].mass)
      for (let rect of this.rect) {
        let velocity = Math.sqrt(rect.velocity.x ** 2 + rect.velocity.y ** 2);
        let acceleration =
          Math.sqrt(rect.force.x ** 2 + rect.force.y ** 2) / rect.mass;

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

  class Grain {
    constructor(track, LengthMapping, isHor) {
      this.track = track;
      this.now = context.currentTime;
      this.source = context.createBufferSource();
      this.source.buffer = track.buffer.buffer;
      this.source.playbackRate.value *= track.settings.trans;

      this.envelope = context.createGain();
      this.source.connect(this.envelope);
      this.envelope.connect(master);

      this.isHor = isHor; //for switching mapping value when dragging grey area
      this.positionX = p.width / 2; //pos= center, spread= audio duration
      this.positionY =
        LengthMapping || this.isHor
          ? p.map(logoWidth, 204, 367, p.height / 2, 0, true)
          : p.map(p.mouseY, p.height / 2, 0, p.height / 2, 0, true);
      this.offset = p.map(
        this.positionX,
        0,
        p.width,
        0,
        track.buffer.duration()
      );
      this.amp = p.map(this.positionY, p.height / 2, 0, 0.05, 0.7);

      this.randomOffset = p.random(
        -track.settings.spread / 2,
        track.settings.spread / 2
      );

      let grainDuration =
        track.settings.attack + track.settings.decay + track.settings.release;
      this.source.start(
        this.now,
        p.max(0, this.offset + this.randomOffset),
        grainDuration
      );

      this.envelope.gain.setValueAtTime(0, this.now);
      this.envelope.gain.linearRampToValueAtTime(
        this.amp,
        this.now + track.settings.attack
      );
      this.envelope.gain.linearRampToValueAtTime(
        this.amp * track.settings.sustain,
        this.now + track.settings.attack + track.settings.decay
      );
      this.envelope.gain.linearRampToValueAtTime(0, this.now + grainDuration);

      this.source.stop(this.now + grainDuration + 0.1);
    }
  }

  class Voice {
    constructor(track, LengthMapping, isHor) {
      this.track = track;
      this.grains = [];
      this.grainCount = 0;
      this.LengthMapping = LengthMapping;
      this.isHor = isHor;
    }

    play() {
      let grain = new Grain(this.track, this.LengthMapping, this.isHor);
      this.grains[this.grainCount] = grain;
      this.grainCount = (this.grainCount + 1) % 20;

      let interval = p.map(this.track.settings.density, 1, 0, 70, 570);
      this.timeout = setTimeout(() => this.play(), interval);
    }

    stop() {
      clearTimeout(this.timeout);
    }
  }

  const {
    Engine,
    World,
    Bodies,
    Body,
    Constraint,
    Mouse,
    MouseConstraint,
    Composite,
  } = Matter;

  let engine;
  let world;
  let texts = [];
  let constraints = [];
  let mConstraint;
  let initialPositions = [];
  let images = [];
  let images2 = [];
  let imagePaths = [
    "img/college.png",
    "img/of.png",
    "img/humanities.png",
    "img/arts.png",
  ];
  // let imagePaths = ['img/of.png', 'img/of.png', 'img/college.png', 'img/of.png', 'img/humanities.png', 'img/arts.png', 'img/of.png', 'img/of.png']; // 替換成你的圖片路徑
  let imagePaths2 = ["img/and.png", "img/social.png", "img/sciences.png"];
  let imageScale = 0.4;
  let imageSpacing = 20;
  let widthWithSpacing = 0;
  let startX = 100;

  let showDebug = false;
  let whValue = 400;
  let imageManager1, imageManager2;

  //logo
  let logoWidth = 0;
  let logoTargetWidth = 0;
  let logoTargetHeight = 40;
  let barX = 0;
  let barY = 0;
  let barW = 0;
  let barH = 0;
  let barTargetX = 0;
  let isScale = false;
  let isBarDrag = false;
  let isClicked = false;
  let isPlay = false;

  //sound
  let context;
  let master;
  let compressor;
  let tracks = [];
  let activeTracks = new Set();
  let activeTracksAmp = new Set();
  let attack = 0.2,
    release = 0.5,
    density = 1;
  let isPanRandom = true;
  let noteBlue;

  // essential global functions
  function fitCanvasSize() {
    //given canvas width and height and window with height, fit canvas to window
    if (GLOBAL.size.ratioFixed) {
      let windowRatio = window.innerWidth / window.innerHeight;
      let canvasRatio = GLOBAL.size.width / GLOBAL.size.height;

      if (windowRatio > canvasRatio) {
        // window is wider than canvas
        let minH = window.innerHeight;
        let minW = minH * canvasRatio;
        //set canvas size
        p.canvas.style.width = minW + "px";
        p.canvas.style.height = minH + "px";
      } else {
        // window is taller than canvas
        let minW = window.innerWidth;
        let minH = minW / canvasRatio;
        //set canvas size
        p.canvas.style.width = minW + "px";
        p.canvas.style.height = minH + "px";
      }
    }
  }

  function windowResized() {
    fitCanvasSize();
  }

  function fileLoaded(index) {
    console.log(`File ${index} loaded`);
    tracks[index].isLoaded = true;
  }

  p.preload = function () {
    imageManager1 = new ImageManager(imagePaths, whValue / 2);
    imageManager2 = new ImageManager(imagePaths2, whValue / 2);

    imageManager1.preloadImages();
    imageManager2.preloadImages();

    p.soundFormats("mp3");
    tracks = [
      {
        buffer: p.loadSound("sound/note_blue.mp3", () => fileLoaded(0)),
        key: "1",
        filename: "note_blue",
      },
      {
        buffer: p.loadSound("sound/note_hor.mp3", () => fileLoaded(1)),
        key: "2",
        filename: "note_hor",
      },
      {
        buffer: p.loadSound("sound/note_ver.mp3", () => fileLoaded(2)),
        key: "3",
        filename: "note_ver",
      },
      {
        buffer: p.loadSound("sound/Bs Cl.mp3", () => fileLoaded(3)),
        key: "4",
        filename: "Bs_Cl",
      },
      {
        buffer: p.loadSound("sound/Ce Solo.mp3", () => fileLoaded(4)),
        key: "5",
        filename: "Ce_Solo",
      },
      {
        buffer: p.loadSound("sound/Crystal Flight(Lead).mp3", () =>
          fileLoaded(5)
        ),
        key: "6",
        filename: "Crystal_Flight(Lead)",
      },
      {
        buffer: p.loadSound("sound/Crystal Flight(Random).mp3", () =>
          fileLoaded(6)
        ),
        key: "7",
        filename: "Crystal_Flight(Random)",
      },
      {
        buffer: p.loadSound("sound/Glass Harp.mp3", () => fileLoaded(7)),
        key: "8",
        filename: "Glass_Harp",
      },
      {
        buffer: p.loadSound("sound/Glitch1.mp3", () => fileLoaded(8)),
        key: "9",
        filename: "Glitch1",
      },
      {
        buffer: p.loadSound("sound/Glitch2.mp3", () => fileLoaded(9)),
        key: "10",
        filename: "Glitch2",
      },
      {
        buffer: p.loadSound("sound/Membrane (Bass).mp3", () => fileLoaded(10)),
        key: "q",
        filename: "Membrane_Bass",
      },
      {
        buffer: p.loadSound("sound/Piano.mp3", () => fileLoaded(11)),
        key: "w",
        filename: "Piano",
      },
      {
        buffer: p.loadSound("sound/Shunt(Pulse).mp3", () => fileLoaded(12)),
        key: "e",
        filename: "Shunt(Pulse)",
      },
      {
        buffer: p.loadSound("sound/StringPizz.mp3", () => fileLoaded(13)),
        key: "r",
        filename: "StringPizz",
      },
      {
        buffer: p.loadSound("sound/Vln Solo.mp3", () => fileLoaded(14)),
        key: "t",
        filename: "Vln _Solo",
      },
    ];

    noteBlue = p.loadSound("sound/note_blue.mp3");
  };

  p.setup = function () {
    let canvas = p.createCanvas(whValue, whValue);
    canvas.parent("sketch1"); // Specify container ID

    p.pixelDensity(4);
    fitCanvasSize();

    engine = Engine.create();
    world = engine.world;

    //no gravity
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;

    widthWithSpacing = imageManager1.calculateWidthWithSpacing();
    logoWidth = widthWithSpacing;
    logoTargetWidth = widthWithSpacing;
    imageManager1.initialize(widthWithSpacing);

    imageManager2.updatePosY(5);
    imageManager2.initialize(widthWithSpacing);

    //blue bar
    barX = p.width / 2;
    barTargetX = p.width / 2;
    barY = 0;
    barW = 0;
    barH = 0;

    // mouse drage(maybe dont need)
    let canvasMouse = Mouse.create(p.canvas.elt);
    let options = {
      mouse: canvasMouse,
    };
    canvasMouse.pixelRatio = p.pixelDensity();

    context = p.getAudioContext();
    master = new p5.Gain();

    // compressor = new p.Compressor();
    // compressor.threshold(-30);
    // compressor.ratio(30);
    // compressor.attack(0.001);
    // compressor.release(0.1);
    // compressor.connect();

    // master.connect(compressor);
    master.connect();

    noteBlue.setVolume(0.5);
    // noteBlue.disconnect();
    // noteBlue.connect(master);

    // Initialize each track with default settings
    tracks.forEach((track) => {
      // track.buffer.disconnect();
      track.buffer.connect(master);
      // track.isLoaded = false;
      track.voices = [];
      track.settings = {
        attack: attack,
        decay: p.random(0.1, 0.5),
        sustain: p.random(0.1, 0.8),
        release: release,
        density: density,
        spread: track.buffer.duration(),
        pan: p.random(-0.5, 0.5),
        trans: 1,
      };
    });
  };

  p.draw = function () {
    p.background(255);
    Engine.update(engine);
    p.rectMode(p.CENTER);

    //draw logo
    let logoHeight = 40;

    logoWidth = p.lerp(logoWidth, logoTargetWidth, logoEasing);
    logoHeight = p.lerp(logoHeight, logoTargetHeight, 0.8);

    let logoPosY = p.height / 2 - logoHeight / 2 - 14;

    //blue bar
    barX = p.lerp(barX, barTargetX, logoEasing);
    barY = logoPosY + 5;
    barW = 10;
    barH = logoHeight - 10;

    p.push();
    p.noFill();
    p.strokeWeight(2);
    p.stroke(isScale ? 100 : 0);
    p.strokeCap(p.SQUARE);
    p.line(
      p.width / 2 - logoWidth / 2,
      logoPosY - logoHeight / 2,
      p.width / 2 - logoWidth / 2,
      logoPosY + logoHeight / 2
    );
    p.line(
      p.width / 2 + logoWidth / 2,
      logoPosY - logoHeight / 2,
      p.width / 2 + logoWidth / 2,
      logoPosY + logoHeight / 2
    );
    p.strokeCap(p.PROJECT);
    p.line(
      p.width / 2 - logoWidth / 2,
      logoPosY - logoHeight / 2,
      p.width / 2 + logoWidth / 2,
      logoPosY - logoHeight / 2
    );
    // rect(width / 2, logoPosY, logoWidth, 40)
    p.noStroke();
    //grey
    p.fill(isScale ? 200 : 178);
    p.rect(p.width / 2, logoPosY - logoHeight / 2 + 15, logoWidth - 20, 10);
    p.rect(p.width / 2, logoPosY + logoHeight / 2 - 5, logoWidth - 20, 10);
    //blue
    p.fill("#0139D9");
    p.rect(barX, barY, barW, barH);

    p.pop();

    if (isShowPos) {
      imageManager1.drawDebug();
      imageManager2.drawDebug();
      p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
    }

    if (isClicked) {
      if (
        p.mouseX > barX - barW / 2 &&
        p.mouseX < barX + barW / 2 &&
        p.mouseY > barY - barH / 2 &&
        p.mouseY < barY + barH
      ) {
        isBarDrag = true;
      }
      if (
        p.mouseX > p.width / 2 - logoWidth / 2 &&
        p.mouseX < p.width / 2 + logoWidth / 2 &&
        p.mouseY > logoPosY - logoHeight / 2 &&
        p.mouseY < logoPosY + logoHeight / 2 &&
        !isBarDrag
      ) {
        isScale = true;
      }
      isClicked = false;
    }
    if (isScale) {
      barTargetX = p.width / 2;
      imageManager1.applyForces();
      imageManager2.applyForces();
      imageManager1.updatePositions();
      imageManager2.updatePositions();
      widthWithSpacing = imageManager1.getNewWidthWithSpacing();
      logoTargetWidth = widthWithSpacing;
      logoTargetHeight = p.map(p.mouseY, logoPosY, 0, 40, 160, true);

      // if (abs(pmouseX - mouseX) > 0) {
      //   activeTracks.add("note_hor");
      // }
      // if (abs(pmouseY - mouseY) > 0) {
      //   activeTracks.add("note_ver");
      // }

      //sound trigger
      if (!isPlay) {
        isPlay = true;
        playTrackWithAmp("note_hor", null, true);
        playTrackWithAmp("note_ver", null, false);
      }
    }
    if (isBarDrag) {
      p.push();
      p.noStroke();
      p.fill("#5075DE");
      p.rect(barX, barY, barW, barH);
      p.pop();

      if (p.mouseX > p.width / 2 + widthWithSpacing / 2 - barW * 3) {
        barTargetX = p.width / 2 + widthWithSpacing / 2 - barW * 3;
      } else if (p.mouseX < p.width / 2 - widthWithSpacing / 2 + barW * 3) {
        barTargetX = p.width / 2 - widthWithSpacing / 2 + barW * 3;
      } else {
        barTargetX = p.mouseX;
      }

      if (p.mouseX > p.width / 2) {
        imageManager1.updateInnerPositions1();
      } else if (p.mouseX < p.width / 2) {
        imageManager2.updateInnerPositions2();
      }
      // barTargetX = map(mouseX, 0, width, width / 2 - 50, width / 2 + 50)

      //sound trigger
      if (!isPlay) {
        isPlay = true;

        //original audio, play once
        if (noteBlue.isLoaded()) {
          noteBlue.play();
        }

        //Grain
        //VERTICAL
        //low: always 100%
        playTrackWithAmp("Crystal_Flight(Lead)", 0);
        playTrackWithAmp("Piano", 0);
        //mid
        playTrackWithAmp(
          "Membrane_Bass",
          p.map(logoHeight, 40, 136, p.height / 2, 0, true)
        );
        //high
        playTrackWithAmp(
          "Crystal_Flight(Random)",
          p.map(logoHeight, 70, 136, p.height / 2, 0, true)
        );

        //HORIZONTAL
        //low: always 100%
        playTrackWithAmp(
          "Vln _Solo",
          p.map(logoWidth, 250, 367, p.height / 2, 0, true)
        );
        playTrackWithAmp("Piano", 0);
        //mid
        playTrackWithAmp("StringPizz", 0);
        playTrackWithAmp(
          "Shunt(Pulse)",
          p.map(logoWidth, 204, 367, p.height / 2, 0, true)
        );
        //high
        playTrackWithAmp(
          "Bs_Cl",
          p.map(logoWidth, 204, 367, p.height / 2, 0, true)
        );
        playTrackWithAmp(
          "Ce_Solo",
          p.map(logoWidth, 250, 367, p.height / 2, 0, true)
        );
      }
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
  };

  function playSelectedTracks(trackNames) {
    let tracksToPlay = tracks.filter(
      (t) => trackNames.includes(t.filename) && t.isLoaded
    );

    if (tracksToPlay.length > 0) {
      tracksToPlay.forEach((track) => {
        let voice = new Voice(track, null);
        voice.play();
        track.voices.push(voice);
        // activeTracks.add(track.filename);
      });
      console.log(`Playing tracks: ${trackNames.join(", ")}`);
    } else {
      console.log("No valid tracks selected or tracks not loaded yet");
    }
  }

  function playTrackWithAmp(trackNames, LengthMapping, isHor) {
    let trackToPlay = tracks.find((t) => t.filename === trackNames);
    if (trackToPlay != null) {
      let voice = new Voice(trackToPlay, LengthMapping, isHor);
      voice.play();
      trackToPlay.voices.push(voice);
      activeTracksAmp.add(trackToPlay.filename);
      console.log(`Playing tracks(amp): ${trackNames}`);
    } else {
      console.log("No valid tracks(amp) selected or tracks not loaded yet");
    }
  }

  function stopSelectedTracks(trackNames) {
    tracks.forEach((track) => {
      if (trackNames.includes(track.filename)) {
        track.voices.forEach((voice) => voice.stop());
        track.voices = [];
        activeTracks.delete(track.filename);
      }
    });

    if (activeTracks.size === 0) {
      p.background(0);
      p.text(
        "Click to toggle playback. Press number keys to select tracks.",
        p.width / 2,
        p.height / 2
      );
    }

    console.log(`Stopped tracks: ${trackNames.join(", ")}`);
  }

  function stopTracksWithAmp(trackNames) {
    tracks.forEach((track) => {
      if (trackNames.includes(track.filename)) {
        track.voices.forEach((voice) => voice.stop());
        track.voices = [];
        activeTracksAmp.delete(track.filename);
      }
    });

    console.log(`Stopped tracks(amp): ${trackNames.join(", ")}`);
  }

  function updateSoundSetting(param, v) {
    if (param == "attack") attack = v;
    if (param == "release") release = v;
    if (param == "density") density = v;
    if (param == "pan") isPanRandom = v;
    tracks.forEach((track) => {
      track.buffer.connect(master);
      // track.isLoaded = false;
      track.voices = [];
      track.settings = {
        attack: attack,
        decay: p.random(0.1, 0.5),
        sustain: p.random(0.1, 0.8),
        release: release,
        density: density,
        spread: track.buffer.duration(),
        pan: isPanRandom ? p.random(-0.5, 0.5) : 0,
        trans: 1,
      };
    });
  }

  p.keyPressed = function () {
    if (p.key == " ") {
      showDebug = !showDebug;
    }

    // let track = tracks.find((t) => t.key === key);
    // if (track && track.isLoaded) {
    //   let voice = new Voice(track);
    //   voice.play();
    //   track.voices.push(voice);
    // } else if (track && !track.isLoaded) {
    //   console.log(`Track ${track.key} is not loaded yet`);
    // }
    console.log(p.key);

    let track = tracks.find((t) => t.key === p.key);
    if (track) {
      if (activeTracks.has(track.filename)) {
        activeTracks.delete(track.filename);
      } else {
        activeTracks.add(track.filename);
      }
      console.log(`Active tracks: ${Array.from(activeTracks).join(", ")}`);
    }
    playSelectedTracks(Array.from(activeTracks));
  };

  p.keyReleased = function () {
    let track = tracks.find((t) => t.key === p.key);
    if (track) {
      for (let voice of track.voices) {
        voice.stop();
      }
      track.voices = [];
    }
    stopSelectedTracks(Array.from(activeTracks));
  };

  p.mousePressed = function () {
    isClicked = true;
    // playSelectedTracks(Array.from(activeTracks));
  };

  p.mouseReleased = function () {
    isClicked = false;
    isScale = false;
    isBarDrag = false;
    isPlay = false;
    stopSelectedTracks(Array.from(activeTracks));
    stopTracksWithAmp(Array.from(activeTracksAmp));
  };

  p.windowResized = function () {
    fitCanvasSize();
  };
};

new p5(sketch);
