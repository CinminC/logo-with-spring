const sketch2 = (p) => {
  let rects = [];
  let totalHeight = 600;
  let numRects = 6;
  let rectWidth = 600;
  let scaleFactor = 1.5;
  let minHeight = 60;
  let minInitialHeight = 20;
  let lerpSpeed = 0.1;
  let lastHoveredIndex = -1;
  let logoH = 10;
  let logoW = 10;
  let targetLogoH = logoH;
  let targetLogoW = logoW;
  let mouseBeforeClick;
  let rectWidthMul;
  let logoX = 0;
  let logoXTarget = 0;

  let imageElements = [],
    imageElements2 = [];

  let imagePaths = [
    "img/college.png",
    "img/of.png",
    "img/humanities.png",
    "img/arts.png",
  ]; // 替換成你的圖片路徑
  // let imagePaths = ['img/of.png', 'img/of.png', 'img/college.png', 'img/of.png', 'img/humanities.png', 'img/arts.png', 'img/of.png', 'img/of.png']; // 替換成你的圖片路徑
  let imagePaths2 = ["img/and.png", "img/social.png", "img/sciences.png"]; // 替換成你的圖片路徑

  let imageScale = 0.1;
  let totalW = 0;
  let totalW2 = 0;

  let springForce = 0.1; // Spring constant
  let damping = 0.8; // Damping factor
  let velocity = 0; // Velocity for spring motion
  let currentLogoWidth = 0; // Current width affected by spring

  let barXCurrent = 0; // Current position of blue bar
  let barVelocity = 0; // Velocity for blue bar movement
  let barSpringForce = 0.2; // Spring force for blue bar
  let barDamping = 0.7; // Damping for blue bar

  let prevMouseX = 0;
  let mouseSpeed = 0;

  let scrollProgress = 0; // Track scroll position
  let rectWidthProgress = 0; // Track width animation progress

  function preloadImages(imagePaths, imageElements) {
    for (let path of imagePaths) {
      imageElements.push(p.loadImage(path));
    }
  }

  function calculateTotalWidth(imageElements) {
    let totalWidth = 0;
    for (let img of imageElements) {
      totalWidth += img.width * imageScale;
    }
    return totalWidth;
  }

  p.preload = function () {
    preloadImages(imagePaths, imageElements);
    preloadImages(imagePaths2, imageElements2);
  };

  p.setup = function () {
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("sketch2"); // Specify container ID
    p.pixelDensity(3);
    rectWidth = p.width;

    // Define easing functions array
    const easingFunctions = [
      { name: "easeOutQuart", fn: easeOutQuart },
      { name: "easeOutExpo", fn: easeOutExpo },
      { name: "easeOutBack", fn: easeOutBack },
      { name: "easeOutBounce", fn: easeOutBounce },
      { name: "easeOutElastic", fn: easeOutElastic },
    ];

    // 初始化长方形的高度
    for (let i = 0; i < numRects; i++) {
      let h = p.random(minInitialHeight, 150);
      let randomEasing = p.random(easingFunctions); // Pick random easing function

      rects.push({
        height: h,
        originalHeight: h,
        targetHeight: h,
        logoH: 10,
        logoW: 10,
        targetLogoH: 10,
        targetLogoW: 10,
        springForce: p.random(0.05, 0.15),
        damping: p.random(0.7, 0.9),
        velocity: 0,
        currentLogoWidth: 0,
        barXCurrent: 0,
        barVelocity: 0,
        barSpringForce: p.random(0.1, 0.3),
        barDamping: p.random(0.7, 0.9),
        hasAddedOffset: false,
        lastMouseX: 0,
        isDragging: false,
        startX: p.width / 2,
        targetX: p.width / 2,
        animationProgress: 1,
        animationDuration: 30,
        easingFunction: randomEasing.fn, // Assign the easing function
        easingName: randomEasing.name, // Store the name for display
        isFirstPress: true,
      });
    }

    // 保证总高度填满画布
    normalizeHeights();
    totalW = calculateTotalWidth(imageElements);
    totalW2 = calculateTotalWidth(imageElements2);
  };

  p.draw = function () {
    p.background(220);

    // Update scroll progress based on container visibility
    const container = document.getElementById("sketch2");
    if (container) {
      const rect = container.getBoundingClientRect();
      const startTrigger = window.innerHeight * 0.8; // Start animation when 80% visible
      if (rect.top < startTrigger) {
        const progress =
          (startTrigger - rect.top) / (startTrigger - rect.height * 0.2);
        scrollProgress = p.constrain(progress, 0, 1);
      } else {
        scrollProgress = 0;
      }
    }

    // Smoothly animate rectWidthProgress
    rectWidthProgress = p.lerp(rectWidthProgress, scrollProgress, 0.1);

    // Calculate current rectangle width and center position
    const currentRectWidth = rectWidth * rectWidthProgress;
    const xOffset = (rectWidth - currentRectWidth) / 2;

    logoXTarget = p.mouseX;
    logoX = p.lerp(logoX, logoXTarget, 0.1);
    let hoveredIndex = -1; // 当前鼠标悬停的长方形索引

    // 检查鼠标是否在某个长方形上
    let yPos = 0;
    if (!p.mouseIsPressed) {
      mouseBeforeClick = p.mouseX;
      for (let i = 0; i < rects.length; i++) {
        if (p.mouseY > yPos && p.mouseY < yPos + rects[i].height) {
          hoveredIndex = i; // 找到悬停的长方形
        }
        yPos += rects[i].height; // 更新 y 位置
      }

      // 如果标离开所有长方形，hoveredIndex 应为 -1
      if (hoveredIndex !== lastHoveredIndex) {
        lastHoveredIndex = hoveredIndex;
        // 调整目标高度
        adjustHeights(hoveredIndex);
      }
    }
    p.print(hoveredIndex, lastHoveredIndex);

    // 使用 lerp 平滑过渡当前高度到目标高度
    let yOffset = 0; // 用于竖直排列
    for (let i = 0; i < rects.length; i++) {
      // 使用 lerp 逐步让当前高度接近目标高度
      rects[i].height = p.lerp(
        rects[i].height,
        rects[i].targetHeight,
        lerpSpeed
      );

      // 绘制长方形 - modified to grow from center
      p.stroke(178);
      p.rect(xOffset, yOffset, currentRectWidth, rects[i].height);

      // 如果当前长方形被悬停，绘制圆形
      if (!p.mouseIsPressed) {
        rectWidthMul = p.map(p.noise(p.mouseX / 20, yOffset), 0, 1, 0.05, 0.7);
      }

      if (i === lastHoveredIndex) {
        // 更新目标圆形大小
        rects[i].targetLogoH = p.lerp(
          rects[i].targetLogoH,
          rects[i].height,
          0.2
        ); // 目标大小设为50
        rects[i].targetLogoW = p.lerp(
          rects[i].targetLogoW,
          rectWidth * rectWidthMul,
          0.1
        );
        drawFullLogo(
          p.mouseIsPressed ? mouseBeforeClick : logoX,
          yOffset + rects[i].height / 2,
          rects[i].targetLogoW,
          rects[i].targetLogoH
        );
      } else {
        if (p.mouseIsPressed) {
          p.push();
          p.noStroke();
          p.fill(178, 100);
          p.rect(0, yOffset + 10, rectWidth, 10);
          p.rect(0, yOffset + rects[i].height - 20, rectWidth, 10);
          p.fill("#7794E4");
          p.rectMode(p.CENTER);

          // Set initial position on first press
          if (rects[i].isFirstPress) {
            rects[i].barXCurrent = p.mouseX;
            rects[i].startX = p.mouseX;
            rects[i].targetX = p.mouseX;
            rects[i].animationProgress = 0; // Reset animation progress
            rects[i].isFirstPress = false;
          }

          // Only start new animation if current one is complete
          if (rects[i].animationProgress >= 1) {
            let newPos = p.noise(i * 100, p.mouseX / 100);
            let newTarget = p.map(newPos, 0, 1, p.width * 0.15, p.width * 0.85);
            if (p.abs(newTarget - rects[i].targetX) > 1) {
              rects[i].startX = rects[i].barXCurrent;
              rects[i].targetX = newTarget;
              rects[i].animationProgress = 0;
            }
          }

          // Update animation with position-based speed
          if (rects[i].animationProgress < 1) {
            let currentDuration = getSpeedForPosition(
              rects[i].barXCurrent,
              p.width
            );
            rects[i].animationProgress += 1 / (currentDuration * 1.5); // Increase duration for more subtle movement
            rects[i].animationProgress = p.min(rects[i].animationProgress, 1);
            let easedProgress = rects[i].easingFunction(
              rects[i].animationProgress
            );
            rects[i].barXCurrent = p.lerp(
              rects[i].startX,
              rects[i].targetX,
              easedProgress
            );
          }

          // Add speed zone display
          p.push();
          p.textAlign(p.LEFT);
          p.textSize(12);
          p.fill(0);
          p.text(
            `Progress: ${rects[i].animationProgress.toFixed(
              2
            )}\nDuration: ${getSpeedForPosition(rects[i].barXCurrent, p.width)}
Easing: ${rects[i].easingName}`,
            rects[i].barXCurrent + 15,
            yOffset + rects[i].height / 2
          );
          p.pop();

          p.rect(
            rects[i].barXCurrent,
            yOffset + rects[i].height / 2,
            10,
            rects[i].height - 20
          );
          p.pop();
        } else {
          // Reset first press flag when mouse is released
          rects[i].isFirstPress = true;

          // When not pressed, animate back to center
          if (rects[i].barXCurrent && rects[i].barXCurrent !== p.width / 2) {
            rects[i].startX = rects[i].barXCurrent;
            rects[i].targetX = p.width / 2;
            rects[i].animationProgress = 0;
          }

          // Update return animation
          if (rects[i].animationProgress < 1) {
            rects[i].animationProgress += 1 / rects[i].animationDuration;
            let easedProgress = rects[i].easingFunction(
              rects[i].animationProgress
            );
            rects[i].barXCurrent = p.lerp(
              rects[i].startX,
              rects[i].targetX,
              easedProgress
            );
          }
        }
      }

      yOffset += rects[i].height; // 累加高度，确保竖直排列
    }

    // Calculate mouse speed at the start of draw
    mouseSpeed = p.abs(p.mouseX - prevMouseX);
    prevMouseX = p.mouseX;
  };

  // 调整目标高度使得总高度保持一致
  function adjustHeights(hoveredIndex) {
    let totalHeight = 0;

    // 计算当前未调整的总高度
    for (let i = 0; i < rects.length; i++) {
      totalHeight += rects[i].height;
    }

    let targetTotalHeight = p.height; // 画布总高度

    // 如果鼠标悬停在某个长方形上，放大该长方形
    if (hoveredIndex !== -1) {
      let expandedHeight = rects[hoveredIndex].originalHeight * scaleFactor; // 放大的高度
      let heightDifference = expandedHeight - rects[hoveredIndex].height; // 需要调整的高度差

      let otherRectsHeight = totalHeight - rects[hoveredIndex].height; // 其他长方形的总高度
      let shrinkFactor =
        (otherRectsHeight - heightDifference) / otherRectsHeight; // 缩放系数

      // 为每个长方形设置目标高度
      for (let i = 0; i < rects.length; i++) {
        if (i === hoveredIndex) {
          rects[i].targetHeight = expandedHeight; // 设置当前悬停长方形的目标高度
        } else {
          rects[i].targetHeight = p.max(
            rects[i].height * shrinkFactor,
            minHeight
          ); // 其他长方形缩小，但保持最小高度
        }
      }
    } else {
      // 如果鼠标没有悬停，所有长方形回到原始高度
      for (let i = 0; i < rects.length; i++) {
        rects[i].targetHeight = rects[i].originalHeight; // 恢复正常高度
      }
    }
  }

  // 初始化时使得总高度填满画布
  function normalizeHeights() {
    let totalHeight = 0;

    // 计算所有长方形的初始高度总和
    for (let i = 0; i < rects.length; i++) {
      totalHeight += rects[i].height;
    }

    let scaleFactor = p.height / totalHeight; // 初始比例

    // 按比例调整每个长方形的高度，使它们的总高度填满画布
    for (let i = 0; i < rects.length; i++) {
      rects[i].height *= scaleFactor;
      rects[i].originalHeight = rects[i].height; // 保存原始高度
      rects[i].targetHeight = rects[i].height; // 初始化目标高度
    }
  }

  function drawFullLogo(x, y, w, h) {
    p.push();
    p.imageMode(p.CENTER);
    p.rectMode(p.CENTER);
    let padding = 10;
    let textTotalH = imageElements[1].width * imageScale * 2 + padding / 2;

    // Get the current rectangle
    let rect = rects[lastHoveredIndex];

    // Apply spring physics to the width using this rectangle's properties
    let force = rect.springForce * (w - rect.currentLogoWidth);
    rect.velocity += force;
    rect.velocity *= rect.damping;
    rect.currentLogoWidth += rect.velocity;

    drawLogo(
      x,
      y + h / 2 - textTotalH - padding * 1.5,
      rect.currentLogoWidth,
      h - textTotalH - padding * 1.5
    );
    drawText(x, y, rect.currentLogoWidth, h, imageScale);

    // Display spring physics values
    p.push();
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.fill(0);
    p.text(
      `Force: ${rect.springForce.toFixed(3)}\nDamping: ${rect.damping.toFixed(
        3
      )}`,
      10, // x position
      y
    ); // y position aligned with current rectangle
    p.pop();

    p.pop();
  }

  function drawLogo(x, y, w, h) {
    let logoWidth = w;
    let logoHeight = h;
    let logoTargetWidth = 100;
    let logoTargetHeight = 50;
    let barX = x;
    let barY = y;
    let barW = 0;
    let barH = 0;
    let barTargetX = 0;
    let logoEasing = 0.1;

    p.rectMode(p.CENTER);

    let logoPosY = barY - logoHeight / 2;

    //blue bar
    barW = 10;
    // barX = p.lerp(barX, barTargetX, logoEasing);
    barY = logoPosY + barW / 2;
    barH = logoHeight - barW;

    p.push();
    p.noFill();
    p.strokeWeight(2);
    p.stroke(0);
    p.strokeCap(p.SQUARE);
    p.line(
      barX - logoWidth / 2,
      logoPosY - logoHeight / 2,
      barX - logoWidth / 2,
      logoPosY + logoHeight / 2
    );
    p.line(
      barX + logoWidth / 2,
      logoPosY - logoHeight / 2,
      barX + logoWidth / 2,
      logoPosY + logoHeight / 2
    );
    p.strokeCap(p.PROJECT);
    p.line(
      barX - logoWidth / 2,
      logoPosY - logoHeight / 2,
      barX + logoWidth / 2,
      logoPosY - logoHeight / 2
    );
    // p.rect(barX, logoPosY, logoWidth, 40)
    p.noStroke();
    //grey
    p.fill(178);
    p.rect(
      barX,
      logoPosY - logoHeight / 2 + barW * 1.5,
      logoWidth - barW * 2,
      barW
    );
    p.rect(
      barX,
      logoPosY + logoHeight / 2 - barW * 0.5,
      logoWidth - barW * 2,
      barW
    );
    //blue
    let targetBarX;
    if (p.mouseIsPressed) {
      targetBarX = p.map(
        p.mouseX,
        0,
        p.width,
        (-w / 2) * 0.9,
        (w / 2) * 0.9,
        true
      );

      // Get the current rectangle using lastHoveredIndex
      let currentRect = rects[lastHoveredIndex];

      // Modify spring force based on mouse speed
      let dynamicSpringForce =
        currentRect.barSpringForce * p.map(mouseSpeed, 0, 50, 0.5, 2, true);

      // Apply spring physics with dynamic force
      let force = dynamicSpringForce * (targetBarX - currentRect.barXCurrent);
      currentRect.barVelocity += force;
      currentRect.barVelocity *= currentRect.barDamping;
      currentRect.barXCurrent += currentRect.barVelocity;

      // Constrain the bar position within the logo bounds
      let maxOffset = logoWidth / 2 - barW * 2;
      currentRect.barXCurrent = p.constrain(
        currentRect.barXCurrent,
        -maxOffset,
        maxOffset
      );

      p.fill("#0139D9");
      p.rect(barX + currentRect.barXCurrent, barY, barW, barH);
    } else {
      // Reset the current rectangle's properties
      let currentRect = rects[lastHoveredIndex];
      currentRect.barXCurrent = 0;
      currentRect.barVelocity = 0;
      p.fill("#0139D9");
      p.rect(barX, barY, barW, barH);
    }
    p.pop();
  }

  function drawText(x, y, w, h, s) {
    let padding = 10;
    let startX = x - w / 2;
    let xx = startX;
    let textTotalH = imageElements[1].width * s * 2;
    let yy = y + h / 2 - textTotalH;
    let imageSpacing = (w - totalW) / 3;
    let imageSpacing2 = (w - totalW2) / 2;

    // Get current rect and its blue bar position
    let currentRect = rects[lastHoveredIndex];
    let barOffset = currentRect.barXCurrent;
    let centerX = p.width / 2;

    // Calculate maximum offset based on spacing
    let maxImageOffset1 = imageSpacing * 0.7; // For first row, 70% of spacing
    let maxImageOffset2 = imageSpacing2 * 0.7; // For second row, 70% of spacing

    // First row
    for (let i = 0; i < imageElements.length; i++) {
      let imageWidth = imageElements[i].width * s;
      let currentX = xx + imageWidth / 2;
      let imageOffset = 0;

      // Move 'of' and 'humanities' (index 1 and 2) when bar moves left
      if ((i === 1 || i === 2) && barOffset < 0) {
        imageOffset = p.map(barOffset, -w / 2, 0, -maxImageOffset1, 0, true);
      }

      p.image(
        imageElements[i],
        currentX + imageOffset,
        yy,
        imageElements[i].width * s,
        imageElements[i].height * s
      );
      xx += imageWidth + imageSpacing;
    }

    // Second row
    xx = startX;

    for (let i = 0; i < imageElements2.length; i++) {
      let imageWidth = imageElements2[i].width * s;
      let imageHeight = imageElements2[i].height * s;
      let currentX = xx + imageWidth / 2;
      let imageOffset = 0;

      // Move 'social' (index 1) when bar moves right
      if (i === 1 && barOffset > 0) {
        imageOffset = p.map(barOffset, 0, w / 2, 0, maxImageOffset2, true);
      }

      p.image(
        imageElements2[i],
        currentX + imageOffset,
        yy + imageHeight + padding / 2,
        imageElements2[i].width * s,
        imageElements2[i].height * s
      );
      xx += imageWidth + imageSpacing2;
    }
  }

  function mousePressed() {
    // noLoop();
  }

  // Add this function after the mousePressed() function
  function getDampingForPosition(x, width) {
    // Define damping zones
    const dampingZones = [
      { start: 0, end: width * 0.2, damping: 0.8 },
      { start: width * 0.2, end: width * 0.4, damping: 0.7 },
      { start: width * 0.4, end: width * 0.6, damping: 0.6 },
      { start: width * 0.6, end: width * 0.8, damping: 0.7 },
      { start: width * 0.8, end: width, damping: 0.8 },
    ];

    // Find which zone the x position is in
    for (let zone of dampingZones) {
      if (x >= zone.start && x <= zone.end) {
        return zone.damping;
      }
    }
    return 0.8; // default damping
  }

  // Add these functions at the bottom of the file
  function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
  }

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }

  function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  // Add this function to define speed zones
  function getSpeedForPosition(x, width) {
    // Define speed zones
    const speedZones = [
      { start: 0, end: width * 0.2, duration: 55 }, // Slowest at edges
      { start: width * 0.2, end: width * 0.4, duration: 45 },
      { start: width * 0.4, end: width * 0.6, duration: 35 }, // Fastest in middle
      { start: width * 0.6, end: width * 0.8, duration: 45 },
      { start: width * 0.8, end: width, duration: 55 }, // Slowest at edges
    ];

    // Find which zone the x position is in
    for (let zone of speedZones) {
      if (x >= zone.start && x <= zone.end) {
        return zone.duration;
      }
    }
    return 35; // default duration
  }

  // Add window resize handler
  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rectWidth = p.width;
    normalizeHeights();
  };
};

// Create the sketch instance
new p5(sketch2);
