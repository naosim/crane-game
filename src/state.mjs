// クレーンの状態パターン
const AbstructState = class {
  crane;
  stage;
  controlButtons; // late init
  name = '';

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
}

/**
 * コントロール状態
 * 左右で操作可能。ボタン押下で下降状態へ遷移
 * @param {*} crane 
 * @param {*} stage 
 */
export const ControlState = class extends AbstructState {
  name = 'control';
  
  constructor(args) {
    super(args);
  }
  draw() {
    const sounds = this.args.sounds;
    if (keyIsDown(RIGHT_ARROW) || this.controlButtons.rightPressed) {
      this.crane.x += this.config.charaSpeed * 2;
      if(!sounds.sound.isPlaying() || sounds.sound.currentTime() > 0.3) {
        sounds.sound.stop();
        sounds.sound.play();
      }
    } else if (keyIsDown(LEFT_ARROW) || this.controlButtons.leftPressed) {
      this.crane.x -= this.config.charaSpeed * 2;
      if(!sounds.sound.isPlaying() || sounds.sound.currentTime() > 0.3) {
        sounds.sound.stop();
        sounds.sound.play();
      }
    }
    return this
  }
  buttonReleased() {
    return new DownState(this.args).init();
  }
}

/**
 * 下降状態
 * 下まで移動するか、ボタン押下で、つかむ状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const DownState = class extends AbstructState {
  name = 'down';
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
    const sounds = this.args.sounds;
    this.crane.y += this.config.charaSpeed;
    if(!sounds.downSound.isPlaying() || sounds.downSound.currentTime() > 0.3) {
      sounds.downSound.stop();
      sounds.downSound.play();
    }
    if(this.crane.y > this.stage.y - 90 ) {
      return new GrabState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return new GrabState(this.args).init();
  }
}

/**
 * つかむ状態
 * つかんだら上昇状態へ遷移
 * @param {Crane} crane 
 * @param {*} stage 
 */
const GrabState = class extends AbstructState {
  name = 'grab';

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
    if(this.count > 60) {
      return new UpState(this.args).init();
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
const UpState = class extends AbstructState {
  name = 'up';
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
    const sounds = this.args.sounds;
    this.crane.y -= this.config.charaSpeed / 2;
    if(!sounds.upSound.isPlaying() || sounds.upSound.currentTime() > 0.3) {
      sounds.upSound.stop();
      sounds.upSound.play();
    }
    if(this.crane.y < this.config.armInitY) {
      return new LeftState(this.args).init();
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
const LeftState = class extends AbstructState {
  name = 'left';
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
    const sounds = this.args.sounds;
    this.crane.x -= this.config.charaSpeed;
    if(!sounds.sound.isPlaying() || sounds.sound.currentTime() > 0.3) {
      sounds.sound.stop();
      sounds.sound.play();
    }
    if(this.crane.x < this.config.armInitX) {
      return new ReleaseState(this.args).init();
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
const ReleaseState = class extends AbstructState {
  name = 'release';

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
    if(this.count > 60) {
      return new ControlState(this.args).init();
    }
    return this;
  }
  buttonReleased() {
    return this;
  }
}
