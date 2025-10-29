// src/state.mjs
var AbstructState = class {
  crane;
  stage;
  controlButtons;
  name = "";
  /**
   * 
   * @param {{crane, stage, controlButtons, config, sounds}} args 
   */
  constructor(args) {
    this.args = args;
    this.crane = args.crane;
    this.stage = args.stage;
    this.controlButtons = args.controlButtons;
    this.config = args.config;
  }
  setControlButtons(v) {
    this.args.controlButtons = v;
    this.controlButtons = v;
  }
  get controlButtons() {
    return this.args.controlButtons;
  }
  init() {
    return this;
  }
  draw() {
    return this;
  }
  buttonReleased() {
    return this;
  }
};
var ControlState = class extends AbstructState {
  name = "control";
  constructor(args) {
    super(args);
  }
  draw() {
    const sounds2 = this.args.sounds;
    if (keyIsDown(RIGHT_ARROW) || this.controlButtons.rightPressed) {
      this.crane.x += this.config.charaSpeed * 2;
      if (!sounds2.sound.isPlaying() || sounds2.sound.currentTime() > 0.3) {
        sounds2.sound.stop();
        sounds2.sound.play();
      }
    } else if (keyIsDown(LEFT_ARROW) || this.controlButtons.leftPressed) {
      this.crane.x -= this.config.charaSpeed * 2;
      if (!sounds2.sound.isPlaying() || sounds2.sound.currentTime() > 0.3) {
        sounds2.sound.stop();
        sounds2.sound.play();
      }
    }
    return this;
  }
  buttonReleased() {
    return new DownState(this.args).init();
  }
};
var DownState = class extends AbstructState {
  name = "down";
  /**
   * 
   * @param {{crane, stage, controlButtons, config}} args 
   */
  constructor(args) {
    super(args);
  }
  init() {
    this.crane.open();
    return this;
  }
  draw() {
    const sounds2 = this.args.sounds;
    this.crane.y += this.config.charaSpeed;
    if (!sounds2.downSound.isPlaying() || sounds2.downSound.currentTime() > 0.3) {
      sounds2.downSound.stop();
      sounds2.downSound.play();
    }
    if (this.crane.y > this.stage.y - 90) {
      return new GrabState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return new GrabState(this.args).init();
  }
};
var GrabState = class extends AbstructState {
  name = "grab";
  count = 0;
  /**
   * 
   * @param {{crane, stage, controlButtons, config}} args 
   */
  constructor(args) {
    super(args);
  }
  init() {
    this.crane.close();
    this.args.sounds.grabSound.play();
    return this;
  }
  draw() {
    this.count++;
    if (this.count > 60) {
      return new UpState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
};
var UpState = class extends AbstructState {
  name = "up";
  /**
   * 
   * @param {{crane, stage, controlButtons, config}} args 
   */
  constructor(args) {
    super(args);
  }
  init() {
    return this;
  }
  draw() {
    const sounds2 = this.args.sounds;
    this.crane.y -= this.config.charaSpeed / 2;
    if (!sounds2.upSound.isPlaying() || sounds2.upSound.currentTime() > 0.3) {
      sounds2.upSound.stop();
      sounds2.upSound.play();
    }
    if (this.crane.y < this.config.armInitY) {
      return new LeftState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
};
var LeftState = class extends AbstructState {
  name = "left";
  /**
   * 
   * @param {{crane, stage, controlButtons, config}} args 
   */
  constructor(args) {
    super(args);
  }
  init() {
    this.crane.weaklyClose();
    return this;
  }
  draw() {
    const sounds2 = this.args.sounds;
    this.crane.x -= this.config.charaSpeed;
    if (!sounds2.sound.isPlaying() || sounds2.sound.currentTime() > 0.3) {
      sounds2.sound.stop();
      sounds2.sound.play();
    }
    if (this.crane.x < this.config.armInitX) {
      return new ReleaseState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
};
var ReleaseState = class extends AbstructState {
  name = "release";
  count = 0;
  /**
   * 
   * @param {{crane, stage, controlButtons, config}} args 
   */
  constructor(args) {
    super(args);
  }
  init() {
    this.crane.open();
    return this;
  }
  draw() {
    this.count++;
    if (this.count > 60) {
      return new ControlState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
};

// src/index.mjs
var level = 4;
var maxPower = 1e3 / Math.pow(1.6, level);
console.log(maxPower);
var trqSpeed = 40 / 5;
var prizeMass = 0.9;
var armInitY = 40;
var armInitX = 60;
var armMass = 4;
var charaSpeed = 1;
var weaklyCloseLengthMin = 28;
var weaklyCloseLengthMax = 35;
var config = {
  level,
  maxPower,
  trqSpeed,
  prizeMass,
  armInitY,
  armInitX,
  armMass,
  charaSpeed,
  weaklyCloseLengthMin,
  weaklyCloseLengthMax
};
var crane;
var context;
function p(cb, v) {
  return [v].map(cb)[0];
}
var Crane = class {
  controlArm = null;
  power = maxPower;
  trqSpeed = trqSpeed;
  isOpened = false;
  get isClosed() {
    return !this.isOpened;
  }
  get x() {
    return this.controlArm.x;
  }
  set x(v) {
    this.controlArm.x = v;
  }
  get y() {
    return this.controlArm.y;
  }
  set y(v) {
    this.controlArm.y = v;
  }
  set mainRopeLength(v) {
    console.log("mainRopeLength:", v);
    this.mainRope.maxLength = v;
  }
  constructor() {
  }
  setup() {
    this.controlArm = p((v) => {
      v = new Sprite(100 + 25, 30, 20, 300, KIN);
      v.offset = { x: 0, y: -150 };
      return v;
    });
    this.boxes = [
      p((v) => {
        v = new Sprite(100 + 25, 35, 50, 20);
        return v;
      }),
      p((v) => {
        v = new Sprite(90, 50, 50, 10);
        return v;
      }),
      p((v) => {
        v = new Sprite(160, 50, 50, 10);
        return v;
      }),
      p((v) => {
        v = new Sprite(70, 50 + 25 - 20, 10, 50);
        v.offset = { x: 0, y: 20 };
        v.mass = armMass;
        v.color = "black";
        v.friction = 0.2;
        return v;
      }),
      p((v) => {
        v = new Sprite(180, 50 + 25 - 20, 10, 50);
        v.offset = { x: 0, y: 20 };
        v.mass = armMass;
        v.color = "black";
        v.friction = 0.2;
        return v;
      }),
      p((v) => {
        v = new Sprite(100 + 25, 20, 60, 15);
        return v;
      }),
      p((v) => {
        v = new Sprite(this.x - 35, 20, 20, 15);
        return v;
      }),
      p((v) => {
        v = new Sprite(this.x + 35, 20, 20, 15);
        return v;
      })
    ];
    new GlueJoint(this.boxes[1], this.boxes[3]);
    new GlueJoint(this.boxes[2], this.boxes[4]);
    new GlueJoint(this.controlArm, this.boxes[5]);
    new GlueJoint(this.boxes[5], this.boxes[6]).springiness = 0;
    new GlueJoint(this.boxes[5], this.boxes[7]).springiness = 0;
    this.joints = [
      p((v) => {
        v = new HingeJoint(this.boxes[0], this.boxes[1]);
        v.offsetA = { x: -20, y: 10 };
        v.upperLimit = 0;
        v.lowerLimit = v.upperLimit - 45;
        return v;
      }),
      p((v) => {
        v = new HingeJoint(this.boxes[0], this.boxes[2]);
        v.offsetA = { x: 20, y: 10 };
        v.range = 30;
        v.lowerLimit = 0;
        v.upperLimit = v.lowerLimit + 45;
        return v;
      })
    ];
    this.mainRope = p((v) => {
      v = new RopeJoint(this.controlArm, this.boxes[0]);
      v.maxLength = 50;
      return v;
    });
    p((v) => {
      v = new RopeJoint(this.boxes[6], this.boxes[3]);
      v.maxLength = 80;
      return v;
    });
    p((v) => {
      v = new RopeJoint(this.boxes[7], this.boxes[4]);
      v.maxLength = 80;
      return v;
    });
    this.open();
  }
  open() {
    this.isOpened = true;
    this.mainRopeLength = 50;
  }
  weaklyClose() {
    this.isOpened = false;
    var weaklyCloseLength = random(weaklyCloseLengthMin, weaklyCloseLengthMax);
    this.mainRopeLength = weaklyCloseLength;
  }
  close() {
    this.isOpened = false;
    this.mainRopeLength = 20;
  }
  draw() {
  }
};
function initStage() {
  var group = new Group();
  var stage = p((v) => {
    v = new group.Sprite(260, 300, 300, 20, KIN);
    v.color = "black";
    v.friction = 0.2;
    return v;
  });
  p((v) => {
    v = new group.Sprite(110, 320, 10, 160, KIN);
    v.color = "black";
    v.friction = 0;
    return v;
  });
  p((v) => {
    v = new group.Sprite(400, 300 - 30, 10, 50, KIN);
    v.color = "black";
    v.friction = 0;
    return v;
  });
  p((v) => {
    v = new group.Sprite(0, 300, 20, 200, KIN);
    v.color = "black";
    v.friction = 0;
    return v;
  });
  p((v) => {
    v = new group.Sprite(60, 400, 100, 20, KIN);
    v.color = "black";
    return v;
  });
  p((v) => {
    v = new group.Sprite(-100, 100, 300, 10, KIN);
    v.color = "black";
    v.rotation = 45;
    v.friction = 0.2;
    return v;
  });
  return stage;
}
var ControlButtons = class {
  leftButton;
  rightButton;
  catchButton;
  leftPressed = false;
  rightPressed = false;
  constructor(context2) {
    this.context = context2;
  }
  init() {
    this.leftButton = createButton("\u25C0");
    this.leftButton.mousePressed(() => {
      this.leftPressed = true;
    });
    this.leftButton.touchStarted(() => {
      this.leftPressed = true;
    });
    this.leftButton.mouseReleased(() => {
      this.leftPressed = false;
    });
    this.leftButton.mouseOut(() => {
      this.leftPressed = false;
    });
    this.leftButton.touchEnded(() => {
      this.leftPressed = false;
    });
    this.leftButton.dragLeave(() => {
      this.leftPressed = false;
    });
    this.rightButton = createButton("\u25B6");
    this.rightButton.mousePressed(() => {
      this.rightPressed = true;
    });
    this.rightButton.touchStarted(() => {
      this.rightPressed = true;
    });
    this.rightButton.mouseReleased(() => {
      this.rightPressed = false;
    });
    this.rightButton.mouseOut(() => {
      this.rightPressed = false;
    });
    this.rightButton.touchEnded(() => {
      this.rightPressed = false;
    });
    this.rightButton.dragLeave(() => {
      this.rightPressed = false;
    });
    this.catchButton = createButton("\u25CF");
    this.catchButton.mouseReleased(() => {
      this.context.state = this.context.state.buttonReleased();
    });
    const resetButton = createButton("\u30EA\u30BB\u30C3\u30C8");
    resetButton.style("width", "60px");
    resetButton.style("font-size", "10px");
    resetButton.mouseReleased(() => {
      resetPrize();
    });
    return this;
  }
};
var prize = null;
function resetPrize() {
  const prizes = [
    new DogPrize(),
    new SnakePrize(),
    new HumanPrize2(),
    new BoxPrize()
  ];
  if (prize) {
    prize.delete();
  }
  prize = random(prizes);
  prize.init();
}
var Sounds = class {
  preload() {
    if (loadSound) {
      this.sound = loadSound("sounds/move.mp3");
      this.downSound = loadSound("sounds/\u30AD\u30E3\u30F3\u30BB\u30EB4.mp3");
      this.upSound = loadSound("sounds/\u6C7A\u5B9A\u30DC\u30BF\u30F3\u3092\u62BC\u305942.mp3");
      this.grabSound = loadSound("sounds/\u6C7A\u5B9A\u30DC\u30BF\u30F3\u3092\u62BC\u305939.mp3");
      this.sound.setVolume(0.2);
      this.downSound.setVolume(0.5);
      this.upSound.setVolume(0.5);
      this.grabSound.setVolume(0.5);
    } else {
      this.sound = {
        isPlaying: () => true,
        currentTime: () => 0,
        play: () => {
        }
      };
      this.downSound = {
        isPlaying: () => true,
        currentTime: () => 0,
        play: () => {
        }
      };
      this.upSound = {
        isPlaying: () => true,
        currentTime: () => 0,
        play: () => {
        }
      };
      this.grabSound = {
        isPlaying: () => true,
        currentTime: () => 0,
        play: () => {
        }
      };
    }
  }
};
var sounds = new Sounds();
window.preload = function() {
  sounds.preload();
};
window.setup = function() {
  createCanvas(400, 400);
  world.gravity.y = 10;
  crane = new Crane();
  var stage = initStage();
  crane.setup();
  resetPrize();
  var state = new ControlState({ crane, stage, controlButtons: null, config, sounds }).init();
  context = { state };
  state.setControlButtons(new ControlButtons(context).init());
  setupInputConfig();
};
function setupInputConfig() {
  var div = createDiv("");
  var text = createElement("span", "\u306C\u3044\u3050\u308B\u307F\u306E\u91CD\u3055: ");
  var input = createElement("input", "v");
  input.attribute("type", "text");
  input.attribute("value", prizeMass);
  var submit = createButton("submit");
  submit.style("width", "60px");
  submit.style("height", "20px");
  submit.mousePressed(() => {
    prizeMass = parseFloat(input.value());
    resetPrize();
  });
  div.child(text);
  div.child(input);
  div.child(submit);
}
window.draw = function() {
  background(220);
  context.state = context.state.draw();
};
var DogPrize = class Prize {
  group;
  init() {
    var group = new Group();
    var head, hand, body, foot;
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    var weightRatio = [1, 1, 1, 1];
    foot = p((v) => {
      v = new group.Sprite(270, 220, 20, 50);
      return v;
    });
    hand = p((v) => {
      v = new group.Sprite(220, 220, 20, 50);
      return v;
    });
    body = p((v) => {
      v = new group.Sprite(240, 200, 110, 20);
      return v;
    });
    head = p((v) => {
      v = new group.Sprite(195, 195, 25, 55);
      v.rotation = 30;
      return v;
    });
    const sprites = [head, hand, body, foot];
    const totalRate = weightRatio.reduce((memo, v) => memo + v, 0);
    sprites.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
    });
    sprites.forEach((v, i) => {
      v.friction = 0.8;
    });
    new GlueJoint(head, body);
    new GlueJoint(hand, body);
    new GlueJoint(foot, body);
    this.group = group;
  }
  delete() {
    this.group.delete();
  }
};
var SnakePrize = class {
  init() {
    const group = this.group = new Group();
    const [x, y] = [260, 200];
    const length = 70;
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    p((v) => {
      v = new group.Sprite(x, y, length, 20);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x - length, y, length, 20);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x + length, y, length, 20);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x - length - 10, y, 20, 50);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x + length + 10, y, 20, 50);
      return v;
    });
    var weightRatio = group.map((v) => 1);
    const totalRate = weightRatio.reduce((memo, v) => memo + v, 0);
    group.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
    });
    p((v) => {
      v = new HingeJoint(group[0], group[1]);
      v.offsetA = { x: -length / 2, y: 0 };
      v.offsetB = { x: length / 2, y: 0 };
    });
    p((v) => {
      v = new HingeJoint(group[0], group[2]);
      v.offsetA = { x: length / 2, y: 0 };
      v.offsetB = { x: -length / 2, y: 0 };
    });
    new GlueJoint(group[1], group[3]);
    new GlueJoint(group[2], group[4]);
  }
  delete() {
    this.group.delete();
  }
};
var HumanPrize2 = class {
  init() {
    var head, body, foot;
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    var weightRatio = [2, 1, 1];
    body = p((v) => {
      v = new Sprite(240, 200, 110, 20);
      return v;
    });
    foot = p((v) => {
      v = new Sprite(260, 200, 20, 70);
      return v;
    });
    head = p((v) => {
      var v = new Sprite();
      v.diameter = 70;
      v.x = 190;
      v.y = 200;
      return v;
    });
    const sprites = [head, body, foot];
    const totalRate = weightRatio.reduce((memo, v) => memo + v, 0);
    sprites.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
    });
    new GlueJoint(head, body);
    new GlueJoint(foot, body);
    this.group = new Group(head, body, foot);
  }
  delete() {
    this.group.delete();
  }
};
var BoxPrize = class {
  init() {
    const group = this.group = new Group();
    const length = 60;
    const [x, y] = [260, 200 + length / 2];
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    p((v) => {
      v = new group.Sprite(x - length / 4, y - length, length / 3, 20);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x - length / 2, y - length / 2, 20, length);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x - length / 4, y, length / 4, 20);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x + length / 4, y, length / 3, 20);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x + length / 2, y - length / 2, 20, length);
      return v;
    });
    p((v) => {
      v = new group.Sprite(x + length / 4, y - length, length / 4, 20);
      return v;
    });
    var weightRatio = group.map((v) => 1);
    const totalRate = weightRatio.reduce((memo, v) => memo + v, 0);
    group.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
    });
    group.forEach((v, i, ary) => {
      if (i == 0) {
        new Joint(ary.at(-1), v);
        return;
      }
      new Joint(ary[i - 1], v);
    });
  }
  delete() {
    this.group.delete();
  }
};
