var requestAnimationFrame =
    requestAnimationFrame ||
    webkitRequestAnimationFrame ||
    mozRequestAnimationFrame ||
    msRequestAnimationFrame ||
    oRequestAnimationFrame;

function timestamp() {
  if (window.performance && window.performance.now) {
    return window.performance.now();
  } else {
    return new Date().getTime();
  }
}

var canvas = document.getElementById("game_canvas");
if (!canvas.getContext) {
  alert("Your browser does not support Canvas.");
}

var sand = new Image();
sand.src = "img/sand.png";

var waves = new Image();
waves.src = "img/waves.png";

var bottle = new Image();
bottle.src = "img/bottle.png";

var bottle_floating = new Image();
bottle_floating.src = "img/bottle_floating.png"

var now = timestamp();
var dt = 0;
var last = timestamp();
var step = 1 / 60;

var stateTime = 0;

var ctx = canvas.getContext("2d");

var objects = [];

function onFrame(canvas) {
  now = timestamp();
  dt = dt + Math.min(1, (now - last) / 1000);
  while (dt > step) {
    dt = dt - step;
    onTick(step);
  }
  onRender(dt);
  last = now;
  requestAnimationFrame(onFrame);
}

function onRender(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(0, 0, 0)";
  if (sand.complete && sand.naturalHeight !== 0) {
    ctx.drawImage(sand, 0, 0);
  }
  if (waves.complete && waves.naturalHeight !== 0) {
    ctx.drawImage(waves, 0, (Math.sin(stateTime) * 32.0) - 128);
  }
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle * (Math.PI / 180));
    if (obj.image.complete && obj.image.naturalHeight !== 0) {
      ctx.drawImage(obj.image, -obj.image.height / 2, -obj.image.width / 2);
    }
    ctx.restore();
  }
}

function onTick(dt) {
  stateTime += dt;
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    switch (obj.type) {
      case "bottle":
        obj.angle -= dt * 120;
        while (obj.angle <= 0) {
          obj.angle += 360;
        }
        obj.x -= dt * 20;
        obj.y -= dt * 120;
        if (obj.angle > 25 && obj.angle < 35) {
          obj.type = "bottle_floating";
          obj.image = bottle_floating;
          obj.angle = 0;
          obj.yoffset = 0;
        }
        break;
      case "bottle_floating":
        obj.y -= obj.yoffset;
        obj.y -= dt * 10;
        obj.yoffset = Math.sin(stateTime) * 32;
        obj.y += obj.yoffset;
        if (obj.y < -64) {
          objects.splice(objects.indexOf(obj), 1);
          return;
        }
        break;
    }
  }
}

function onThrow() {
  if (document.getElementById("message").value !== "") {
    objects.push({
      "image": bottle,
      "x": 600,
      "y": 600,
      "angle": 0,
      "type": "bottle"
    });
    document.getElementById("message").value = "";
  }
}

requestAnimationFrame(onFrame);
