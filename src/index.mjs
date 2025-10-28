const level = 4;
const maxPower = 1000 / Math.pow(1.6, level);
console.log(maxPower);
const trqSpeed = 40/5;

var prizeMass = 0.9;
const armInitY = 40;
const armInitX = 60;
const armMass = 4;
const charaSpeed = 1;
const weaklyCloseLengthMin = 28; // もっともつよい
const weaklyCloseLengthMax = 35; // 最もゆるい
var crane;
var context;
var state;
var controlButtons;
function p(cb, v) {
  return [v].map(cb)[0]
}

/**
 * クレーン
 */
const Crane = class {
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
    console.log('mainRopeLength:', v);
    this.mainRope.maxLength = v;
  }

  constructor() {}
  setup() {
    this.controlArm = p((v) => {
      v = new Sprite(100 + 25, 30, 20, 300, KIN)
      v.offset = {x:0, y:-150}
      return v;
    })
    // const armMass = 5;
    this.boxes = [
      p((v) => {
        v = new Sprite(100 + 25, 35, 50, 20)
        // v.offset = {x: 0, y: -120}
        return v;
      }),
      p((v) => {
        v = new Sprite(90, 50, 50, 10)
        // v.mass = 2;
        return v;
      }),
      p((v) => {
        v = new Sprite(160, 50, 50, 10);
        // v.mass = 2;
        return v;
      }),
      p((v) => {
        v = new Sprite(70, 50 + 25 - 20, 10, 50)
        v.offset = {x: 0, y: 20}
        v.mass = armMass;
        v.color = 'black'
        v.friction = 0.2;
        return v;
      }),
      p((v) => {
        v = new Sprite(180, 50 + 25 - 20, 10, 50)
        v.offset = {x: 0, y: 20}
        v.mass = armMass;
        v.color = 'black'
        v.friction = 0.2;
        return v;
      }),
      p((v) => {
        v = new Sprite(100 + 25, 20, 60, 15)
        return v;
      }),
      p((v) => {
        v = new Sprite(this.x - 35, 20, 20, 15)
        return v;
      }),
      p((v) => {
        v = new Sprite(this.x + 35, 20, 20, 15)
        return v;
      }),
    ]

    new GlueJoint(this.boxes[1], this.boxes[3]);
    new GlueJoint(this.boxes[2], this.boxes[4]);
    new GlueJoint(this.controlArm, this.boxes[5]);
    new GlueJoint(this.boxes[5], this.boxes[6]).springiness  = 0;
    new GlueJoint(this.boxes[5], this.boxes[7]).springiness  = 0;

    this.joints = [
      p(v => {
        v = new HingeJoint(this.boxes[0], this.boxes[1]);
        v.offsetA = {x: -20, y: 10}
        // v.range = 50;
        v.upperLimit = 0;
        v.lowerLimit = v.upperLimit - 45;
        // v.maxPower = this.power;
        // v.enableMotor = true;
        return v;
      }),
      p(v => {
        v = new HingeJoint(this.boxes[0], this.boxes[2]);
        v.offsetA = {x: 20, y: 10}
        v.range = 30;
        v.lowerLimit = 0;
        v.upperLimit = v.lowerLimit + 45;
        // v.maxPower = this.power;
        // v.enableMotor = true;
        return v;
      })
    ];
    
    this.mainRope  = p(v => {
      v = new RopeJoint(this.controlArm, this.boxes[0]);
      // v.offsetB = {x:0, y:-10}
      // v.range = 40;
      v.maxLength = 50;
      return v;
    })

    p(v => {
      v = new RopeJoint(this.boxes[6], this.boxes[3]);
      // v.offsetB = {x:0, y:-10}
      // v.range = 40;
      v.maxLength = 80;
      return v;
    })

    p(v => {
      v = new RopeJoint(this.boxes[7], this.boxes[4]);
      // v.offsetB = {x:0, y:-10}
      // v.range = 40;
      v.maxLength = 80;
      return v;
    })
    
    this.open();
  }
  
  open() {
    this.isOpened = true;
    this.mainRopeLength = 50;
    // this.joints[0].speed = this.trqSpeed * 2;
    // this.joints[1].speed = -this.trqSpeed * 2;
  }
  weaklyClose() {
    this.isOpened = false;
    var weaklyCloseLength = random(weaklyCloseLengthMin, weaklyCloseLengthMax);
    this.mainRopeLength = weaklyCloseLength;
  }
  close() {
    this.isOpened = false;
    this.mainRopeLength = 20;
    // this.joints[0].speed = -this.trqSpeed;
    // this.joints[1].speed = this.trqSpeed;
  }
  draw() {
  }
}

function initStage() {
  var group = new Group();
  var stage = p(v => {
    v = new group.Sprite(260, 300, 300, 20, KIN);
    v.color = 'black';
    v.friction = 0.2;
    return v;
  })
  p(v => {
    v = new group.Sprite(110, 320, 10, 160, KIN);
    v.color = 'black';
    v.friction = 0.0;
    return v;
  });
  p(v => {
    v = new group.Sprite(400, 300 - 30, 10, 50, KIN);
    v.color = 'black';
    v.friction = 0.0;
    return v;
  })
  p(v => {
    v = new group.Sprite(0, 300, 20, 200, KIN);
    v.color = 'black';
    v.friction = 0.0;
    return v;
  })
  p(v => {
    v = new group.Sprite(60, 400, 100, 20, KIN);
    v.color = 'black';
    return v;
  })
  // 画面外のかべ
  p(v => {
    v = new group.Sprite(-100, 100, 300, 10, KIN);
    v.color = 'black';
    v.rotation = 45;
    v.friction = 0.2;
    return v;
  })
  return stage;
}



class ControlButtons {
  leftButton;
  rightButton;
  catchButton;
  leftPressed = false;
  rightPressed = false;
  constructor(context) {
    this.context = context;
  }
  init() {
    this.leftButton = createButton("◀");
    this.leftButton.mousePressed(() => {this.leftPressed = true});
    this.leftButton.touchStarted(() => {this.leftPressed = true});
    this.leftButton.mouseReleased(() => {this.leftPressed = false});
    this.leftButton.mouseOut(() => {this.leftPressed = false});
    this.leftButton.touchEnded(() => {this.leftPressed = false});
    this.leftButton.dragLeave(() => {this.leftPressed = false});
    
    this.rightButton = createButton("▶");
    this.rightButton.mousePressed(() => {this.rightPressed = true}); 
    this.rightButton.touchStarted(() => {this.rightPressed = true});
    this.rightButton.mouseReleased(() => {this.rightPressed = false});
    this.rightButton.mouseOut(() => {this.rightPressed = false});
    this.rightButton.touchEnded(() => {this.rightPressed = false});
    this.rightButton.dragLeave(() => {this.rightPressed = false});

    
    this.catchButton = createButton("●");
    this.catchButton.mouseReleased(() => {this.context.state = this.context.state.buttonReleased()});

    const resetButton = createButton("リセット");
    resetButton.style('width', '60px');
    resetButton.style('font-size', '10px');
    resetButton.mouseReleased(() => {resetPrize()});
    return this;
  }
}

var prize = null;

function resetPrize() {
  const prizes = [
    new DogPrize(),
    new SnakePrize(),
    new HumanPrize2(),
    new BoxPrize(),
  ];
  if(prize) {
    prize.delete();
  }
  prize = random(prizes);
  prize.init();
}

class Sounds {
  preload() {
    if(loadSound) {
      this.sound = loadSound('sounds/move.mp3')
      this.downSound = loadSound('sounds/キャンセル4.mp3')
      this.upSound = loadSound('sounds/決定ボタンを押す42.mp3')
      this.grabSound = loadSound('sounds/決定ボタンを押す39.mp3')
      this.sound.setVolume(0.2);
      this.downSound.setVolume(0.5);
      this.upSound.setVolume(0.5);
      this.grabSound.setVolume(0.5);
    } else {
      this.sound = {
        isPlaying:() => true,
        currentTime:() => 0,
        play:() => {}
      };
      this.downSound = {
        isPlaying:() => true,
        currentTime:() => 0,
        play:() => {}
      };
      this.upSound = {
        isPlaying:() => true,
        currentTime:() => 0,
        play:() => {}
      };
      this.grabSound = {
        isPlaying:() => true,
        currentTime:() => 0,
        play:() => {}
      };

    }
    
  }
}
// setup前に音源を読み込む
const sounds = new Sounds();
window.preload = function() {
  sounds.preload();
}

window.setup = function() {
  createCanvas(400, 400);
  world.gravity.y = 10;
  crane = new Crane();
  var stage = initStage()
  crane.setup();
  resetPrize();
  var state = new ControlState(crane, stage).init();
  context = {state};
  controlButtons = new ControlButtons(context).init();

  setupInputConfig();
  
  
}

function setupInputConfig() {
  var div = createDiv('');
  var text = createElement('span', 'ぬいぐるみの重さ: ');
  var input = createElement('input','v');
  input.attribute('type', 'text');
  input.attribute('value', prizeMass);

  var submit = createButton('submit');
  submit.style('width', '60px');
  submit.style('height', '20px');
  submit.mousePressed(() => {
    prizeMass = parseFloat(input.value());
    resetPrize();
  });

  div.child(text);
  div.child(input);
  div.child(submit);
  // text.appendTo(div);
  // input.appendTo(div);
}

window.draw = function() {
  background(220);
  context.state = context.state.draw();
}


function keyReleased() {
  // // console.log("press");
  if(key != ' ' && key != DOWN_ARROW) {
    return;
  }
  context.state = context.state.buttonReleased();
}

// クレーンの状態パターン
const AbstructState = class {
  crane;
  stage;
  name = 'down';
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
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
}

/**
 * コントロール状態
 * 左右で操作可能。ボタン押下で下降状態へ遷移
 * @param {*} crane 
 * @param {*} stage 
 */
const ControlState = class {
  crane;
  name = 'control';
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
  }
  init() {
    return this;
  }
  draw() {
    if (keyIsDown(RIGHT_ARROW) || controlButtons.rightPressed) {
      this.crane.x += charaSpeed * 2;
      if(!sounds.sound.isPlaying() || sounds.sound.currentTime() > 0.3) {
        sounds.sound.stop();
        sounds.sound.play();
      }
    } else if (keyIsDown(LEFT_ARROW) || controlButtons.leftPressed) {
      this.crane.x -= charaSpeed * 2;
      if(!sounds.sound.isPlaying() || sounds.sound.currentTime() > 0.3) {
        sounds.sound.stop();
        sounds.sound.play();
      }
    }
    return this
  }
  buttonReleased() {
    return new DownState(this.crane, this.stage).init();
  }
}

/**
 * 下降状態
 * 下まで移動するか、ボタン押下で、つかむ状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const DownState = class {
  crane;
  stage;
  name = 'down';
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
  }
  init() {
    this.crane.open();
    return this;
  }
  draw() {
    this.crane.y += charaSpeed;
    if(!sounds.downSound.isPlaying() || sounds.downSound.currentTime() > 0.3) {
      sounds.downSound.stop();
      sounds.downSound.play();
    }
    if(this.crane.y > this.stage.y - 90 ) {
      return new GrabState(this.crane, this.stage).init();
    }
    return this;
  }
  buttonReleased() {
    return new GrabState(this.crane, this.stage).init();
  }
}

/**
 * つかむ状態
 * つかんだら上昇状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const GrabState = class {
  crane;
  stage;
  name = 'grab';

  count = 0;
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
  }
  init() {
    this.crane.close();
    sounds.grabSound.play();
    return this;
  }
  draw() {
    this.count++;
    if(this.count > 60) {
      return new UpState(this.crane, this.stage).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
}

/**
 * 上昇状態
 * あがったら左移動状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const UpState = class {
  crane;
  stage;
  name = 'up';
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
  }
  init() {
    return this;
  }
  draw() {
    this.crane.y -= charaSpeed / 2;
    if(!sounds.upSound.isPlaying() || sounds.upSound.currentTime() > 0.3) {
      sounds.upSound.stop();
      sounds.upSound.play();
    }
    if(this.crane.y < armInitY) {
      return new LeftState(this.crane, this.stage).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
}

/**
 * 左移動状態
 * 左へ移動したら放す状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const LeftState = class {
  crane;
  stage;
  name = 'left';
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
  }
  init() {
    crane.weaklyClose();
    return this;
  }
  draw() {
    this.crane.x -= charaSpeed;
    if(!sounds.sound.isPlaying() || sounds.sound.currentTime() > 0.3) {
      sounds.sound.stop();
      sounds.sound.play();
    }
    if(this.crane.x < armInitX) {
      return new ReleaseState(this.crane, this.stage).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
}

/**
 * 放す状態
 * 放したらコントロール状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const ReleaseState = class {
  crane;
  stage;
  name = 'release';

  count = 0;
  constructor(crane, stage) {
    this.crane = crane;
    this.stage = stage;
  }
  init() {
    this.crane.open();
    return this;
  }
  draw() {
    this.count++;
    if(this.count > 60) {
      return new ControlState(this.crane, this.stage).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
}

const Prize = class {
  init() {
    
  }
  delete() {}
}

const DogPrize = class Prize {
  group;
  init() {
    // ぬいぐるみ
    var group = new Group();
    var head, hand, body, foot;
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    var weightRatio = [1,1,1,1];
    
    
    foot = p(v => {
      v = new group.Sprite(270, 220, 20, 50);
      return v;
    })
    hand = p(v => {
      v = new group.Sprite(220, 220, 20, 50);
      return v;
    })
    body = p(v => {
      v = new group.Sprite(240, 200, 110, 20);
      return v;
    })
    head = p(v => {
      v = new group.Sprite(195, 195, 25, 55);
      v.rotation = 30;
      return v;
    })
    

    // 重さの最適化
    const sprites = [head, hand, body, foot];
    const totalRate = weightRatio.reduce((memo,v) => memo + v, 0);
    sprites.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
      // v.physicsType = STATIC;
    })

    // デバッグ用
    sprites.forEach((v, i) => {
      v.friction = 0.8;
      // v.physicsType = STATIC;
    })
    new GlueJoint(head, body);
    new GlueJoint(hand, body);
    new GlueJoint(foot, body);
    this.group = group;
  }

  delete() {
    this.group.delete();
  }
}

const SnakePrize = class {
  init() {
    // ぬいぐるみ
    const group = this.group = new Group();
    const [x, y] = [260, 200];
    const length = 70;
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    //var weightRatio = [2,1,1];
    p(v => {
      v = new group.Sprite(x, y, length, 20);
      return v;
    })
    p(v => {
      v = new group.Sprite(x - length, y, length, 20);
      return v;
    })
    p(v => {
      v = new group.Sprite(x + length, y, length, 20);
      return v;
    })

    p(v => {
      v = new group.Sprite(x - length - 10, y, 20, 50);
      return v;
    })
    p(v => {
      v = new group.Sprite(x + length + 10, y, 20, 50);
      return v;
    })
    var weightRatio = group.map(v => 1);
    const totalRate = weightRatio.reduce((memo,v) => memo + v, 0);
    group.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
      // v.physicsType = STATIC;
    })


    p(v => {
      v = new HingeJoint(group[0], group[1]);
      v.offsetA = {x: -length/2, y: 0};
      v.offsetB = {x: length/2, y: 0};
    })
    p(v => {
      v = new HingeJoint(group[0], group[2]);
      v.offsetA = {x: length/2, y: 0};
      v.offsetB = {x: -length/2, y: 0};
    })

    new GlueJoint(group[1], group[3]);
    new GlueJoint(group[2], group[4]);

    // group[1].rotation = 40;
    
  }
  delete() {
    this.group.delete();
  }
}

const HumanPrize2 = class {
  init() {
    var head, body, foot;
    var mass = prizeMass;
    console.log("prizeMass:", mass);
    var weightRatio = [2,1,1];
    body = p(v => {
      v = new Sprite(240, 200, 110, 20);
      return v;
    })
    foot = p(v => {
      v = new Sprite(260, 200, 20, 70);
      return v;
    })
    head = p(v => {
      var v = new Sprite();
      v.diameter = 70;
      v.x = 190;
      v.y = 200;
      return v;
    })

    // 重さの最適化
    const sprites = [head, body, foot];
    const totalRate = weightRatio.reduce((memo,v) => memo + v, 0);
    sprites.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
      // v.physicsType = STATIC;
    })

    // デバッグ用
    // sprites.forEach((v, i) => {
    //   v.physicsType = STATIC;
    // })

    new GlueJoint(head, body);
    new GlueJoint(foot, body);
    this.group = new Group(head, body, foot);
  }
  delete() {
    this.group.delete();
  }
}

const BoxPrize = class {
  init() {
    // ぬいぐるみ
    const group = this.group = new Group();
    const length = 60;
    const [x, y] = [260, 200 + length/2];
    
    var mass = prizeMass;
    console.log("prizeMass:", mass);

    // 上左
    p(v => {
      v = new group.Sprite(x - length/4, y - length, length/3, 20);
      return v;
    })
    // 左
    p(v => {
      v = new group.Sprite(x - length/2, y - length/2, 20, length);
      return v;
    })
    // 下
    // p(v => {
    //   v = new group.Sprite(x, y, length, 20);
    //   return v;
    // })
    // 下左
    p(v => {
      v = new group.Sprite(x - length/4, y, length/4, 20);
      return v;
    })
    // 下右
    p(v => {
      v = new group.Sprite(x + length/4, y, length/3, 20);
      return v;
    })
    // 右
    p(v => {
      v = new group.Sprite(x + length/2, y - length/2, 20, length);
      return v;
    })
    // 上右
    p(v => {
      v = new group.Sprite(x + length/4, y - length, length/4, 20);
      return v;
    })

    var weightRatio = group.map(v => 1);
    const totalRate = weightRatio.reduce((memo,v) => memo + v, 0);
    group.forEach((v, i) => {
      v.mass = mass * weightRatio[i] / totalRate;
      // v.physicsType = STATIC;
    })

    group.forEach((v, i, ary) => {
      if(i == 0) {
        new Joint(ary.at(-1), v);
        return;
      }
      new Joint(ary[i - 1], v);
    })
    
  }
  delete() {
    this.group.delete();
  }
}