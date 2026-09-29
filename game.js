/* Don't Step on Thirteen (PewPlay edition). Original game by daivan & Håkan Einarsson for js13kGames 2024 (ISC, see LICENSE). Sound: ZzFX by Frank Force (MIT). Bundled with esbuild from the readable ES module sources; kontra.js was replaced by small hand-written equivalents. */
(() => {
  // audio.js
  var STORAGE_KEY = "dont-step-on-thirteen:muted";
  var ctx = null;
  var volume = 0.3;
  var muted = false;
  try {
    muted = localStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {
  }
  function unlockAudio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        ctx = new AC();
      } catch (e) {
        ctx = null;
        return;
      }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {
    });
  }
  function isMuted() {
    return muted;
  }
  function setMuted(value) {
    muted = value;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch (e) {
    }
  }
  function zzfx(p = 1, k = 0.05, b = 220, e = 0, r = 0, t = 0.1, q = 0, D = 1, u = 0, y = 0, v = 0, z = 0, l = 0, E = 0, A = 0, F = 0, c = 0, w = 1, m = 0, B = 0, N = 0) {
    let M = Math, d = 2 * M.PI, R = 44100, G = u *= 500 * d / R / R, C = b *= (1 - k + 2 * k * M.random(k = [])) * d / R, g = 0, H = 0, a = 0, n = 1, I = 0, J = 0, f = 0, h = N < 0 ? -1 : 1, x = d * h * N * 2 / R, L = M.cos(x), Z = M.sin, K = Z(x) / 4, O = 1 + K, X = -2 * L / O, Y = (1 - K) / O, P = (1 + h * L) / 2 / O, Q = -(h + L) / O, S = P, T = 0, U = 0, V = 0, W = 0;
    e = R * e + 9;
    m *= R;
    r *= R;
    t *= R;
    c *= R;
    y *= 500 * d / R ** 3;
    A *= d / R;
    v *= d / R;
    z *= R;
    l = R * l | 0;
    p *= volume;
    for (h = e + m + r + t + c | 0; a < h; k[a++] = f * p) {
      ++J % (100 * F | 0) || (f = q ? 1 < q ? 2 < q ? 3 < q ? Z(g ** 3) : M.max(M.min(M.tan(g), 1), -1) : 1 - (2 * g / d % 2 + 2) % 2 : 1 - 4 * M.abs(M.round(g / d) - g / d) : Z(g), f = (l ? 1 - B + B * Z(d * a / l) : 1) * (f < 0 ? -1 : 1) * M.abs(f) ** D * (a < e ? a / e : a < e + m ? 1 - (a - e) / m * (1 - w) : a < e + m + r ? w : a < h - c ? (h - a - c) / t * w : 0), f = c ? f / 2 + (c > a ? 0 : (a < h - c ? 1 : (h - a) / c) * k[a - c | 0] / 2 / p) : f, N ? f = W = S * T + Q * (T = U) + P * (U = f) - Y * V - X * (V = W) : 0);
      x = (b += u += y) * M.cos(A * H++);
      g += x + x * E * Z(a ** 5);
      n && ++n > z && (b += v, C += v, n = 0);
      !l || ++I % l || (b = C, u = G, n = n || 1);
    }
    const buffer = ctx.createBuffer(1, h, R);
    buffer.getChannelData(0).set(k);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
  var SOUNDS = {
    explosion: [, , 68, 0.01, 0.03, 0.76, 2, 1.2, 5, , , , , 1.5, , 0.2, , 0.32, 0.12, 0.4],
    pickup: [, , 590, 0.01, 0.07, , 1, 1.3, , -96, 443, 0.06, 0.03, , , , , 0.83, 0.04],
    update: [, , 919, 0.01, , 0.02, 1, 4.4, 51, -17, , , , , 113, , , 0.66, 0.02, 0.13, -1319],
    levelup: [0.6, , 405, 0.09, 0.13, 0.14, , 1.4, , -3, -198, 0.05, 0.05, , , , , 0.82, 0.21, , 170],
    boost: [0.5, , 300, 0.02, 0.05, 0.08, 1, 1.5, 6, , , , , , , , , 0.7, 0.03],
    shield: [0.5, , 520, 0.03, 0.08, 0.15, , 1.2, , , 120, 0.05, , , , , , 0.8, 0.04]
  };
  function play(name, vol = 0.3) {
    if (muted || !ctx || ctx.state !== "running") return;
    volume = vol;
    try {
      zzfx(...SOUNDS[name]);
    } catch (e) {
    }
  }

  // board.js
  var TILE = 64;
  var BOARD = TILE * 9;
  var COLS = 8;
  var RED = "#ae3b2f";
  var GREEN = "#41772f";
  function seededRandom(seed) {
    const x = Math.sin(seed) * 1e4;
    return x - Math.floor(x);
  }
  function levelColor(level, seed = 7) {
    const r = Math.floor(seededRandom(seed + level) * 256);
    const g = Math.floor(seededRandom(seed + level + 1) * 256);
    const b = Math.floor(seededRandom(seed + level + 2) * 256);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }
  var Board = class {
    constructor(image2) {
      this.image = image2;
      this.level = 1;
      this.silent = true;
      this.reset();
    }
    reset() {
      this.horizontal = [];
      this.vertical = [];
      for (let i = 0; i < COLS; i++) {
        this.horizontal.push(i % 5 + 1);
        this.vertical.push(i % 5 + 1);
      }
      this.timer = 0;
      this.computeThirteens();
      this.warnings = [];
    }
    // Seconds between two number shifts: 2s at level 1, a little faster every level.
    get interval() {
      return 2 / (1 + (this.level - 1) * 0.1);
    }
    get shiftProgress() {
      return Math.min(1, this.timer / this.interval);
    }
    sum(col, row) {
      return this.horizontal[col] + this.vertical[row];
    }
    computeThirteens() {
      this.dangerCols = /* @__PURE__ */ new Set();
      this.dangerRows = /* @__PURE__ */ new Set();
      this.dangerTiles = [];
      for (let i = 0; i < COLS - 1; i++) {
        for (let j = 0; j < COLS - 1; j++) {
          if (this.horizontal[i] + this.vertical[j] === 13) {
            this.dangerCols.add(i);
            this.dangerRows.add(j);
            this.dangerTiles.push({ x: i, y: j });
          }
        }
      }
    }
    shiftNumbers() {
      this.horizontal.shift();
      this.horizontal.push(Math.floor(Math.random() * 9) + 1);
      this.vertical.shift();
      this.vertical.push(Math.floor(Math.random() * 9) + 1);
      this.computeThirteens();
      this.warnings = this.dangerTiles.map((t) => ({ x: t.x, y: t.y, alpha: 1 }));
      if (!this.silent) play("update");
    }
    update(dt) {
      this.timer += dt;
      if (this.timer > this.interval) {
        this.timer = 0;
        this.shiftNumbers();
      }
      for (const w of this.warnings) w.alpha = Math.max(0, w.alpha - dt * 0.78);
      this.warnings = this.warnings.filter((w) => w.alpha > 0);
    }
    drawCannon(ctx3, x, y, state, rotated) {
      const fill = state === "red" ? RED : state === "green" ? GREEN : null;
      if (!rotated) {
        if (fill) {
          ctx3.fillStyle = fill;
          ctx3.fillRect(x + 20, y + 8, 26, 13);
        } else if (state > 0.75) {
          ctx3.fillStyle = `rgba(237, 192, 109, ${(state - 0.75) * 4})`;
          ctx3.fillRect(x + 20, y + 8, 26, 13);
        }
        ctx3.drawImage(this.image, TILE, 0, TILE, TILE, x, y, TILE, TILE);
      } else {
        if (fill) {
          ctx3.fillStyle = fill;
          ctx3.fillRect(x + 8, y + 20, 13, 26);
        } else if (state > 0.75) {
          ctx3.fillStyle = `rgba(237, 192, 109, ${(state - 0.75) * 4})`;
          ctx3.fillRect(x + 8, y + 20, 13, 26);
        }
        ctx3.save();
        ctx3.translate(x, y + TILE);
        ctx3.rotate(-Math.PI / 2);
        ctx3.drawImage(this.image, TILE, 0, TILE, TILE, 0, 0, TILE, TILE);
        ctx3.restore();
      }
    }
    render(ctx3) {
      const tileColor = levelColor(this.level);
      for (let row = 1; row < 8; row++) {
        for (let col = 1; col < 8; col++) {
          if ((row + col) % 2 === 0) {
            const x = col * TILE, y = row * TILE;
            ctx3.fillStyle = tileColor;
            ctx3.fillRect(x, y, TILE, TILE);
            ctx3.drawImage(this.image, 0, 0, TILE, TILE, x, y, TILE, TILE);
          }
        }
      }
      for (let i = 1; i < 8; i++) {
        this.drawCannon(ctx3, i * TILE, 0, this.dangerCols.has(i - 1) ? "red" : "green", false);
        this.drawCannon(ctx3, 0, i * TILE, this.dangerRows.has(i - 1) ? "red" : "green", true);
      }
      const p = this.shiftProgress;
      this.drawCannon(ctx3, 8 * TILE, 0, p, false);
      this.drawCannon(ctx3, 0, 8 * TILE, p, true);
      for (const w of this.warnings) {
        ctx3.fillStyle = `rgba(174, 59, 47, ${w.alpha})`;
        ctx3.fillRect(w.x * TILE + TILE, w.y * TILE + TILE, TILE, TILE);
      }
      ctx3.fillStyle = "#fff";
      ctx3.font = "bold 22px Arial, Helvetica, sans-serif";
      ctx3.textAlign = "center";
      ctx3.textBaseline = "middle";
      ctx3.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx3.shadowBlur = 3;
      for (let i = 0; i < COLS; i++) {
        ctx3.fillText(String(this.horizontal[i]), i * TILE + TILE + 32, 39);
        ctx3.fillText(String(this.vertical[i]), 38, i * TILE + TILE + 33);
      }
      ctx3.shadowBlur = 0;
      ctx3.shadowColor = "transparent";
    }
  };

  // game.js
  var BEST_KEY = "dont-step-on-thirteen:best";
  var PLAYER_START = 5 * TILE - 32;
  var MIN_POS = TILE + 32;
  var MAX_POS = TILE * 8 - 32;
  function randomTile() {
    return Math.floor(Math.random() * 7) * TILE + TILE;
  }
  var Game = class {
    constructor(image2) {
      this.image = image2;
      this.board = new Board(image2);
      this.scene = "START";
      this.score = 0;
      this.level = 1;
      this.effects = [];
      this.goal = { x: randomTile(), y: randomTile() };
      this.player = { x: PLAYER_START, y: PLAYER_START, rotation: 0 };
      this.resetPlayer();
      this.best = 0;
      try {
        this.best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
      } catch (e) {
      }
      this.onGameOver = null;
    }
    resetPlayer() {
      Object.assign(this.player, {
        x: PLAYER_START,
        y: PLAYER_START,
        rotation: 0,
        speed: 2,
        energy: 100,
        turbo: false,
        stealthed: false,
        dead: false
      });
    }
    start() {
      this.level = 1;
      this.board.level = 1;
      this.board.reset();
      this.board.silent = false;
      this.effects = [];
      this.resetPlayer();
      this.score = 0;
      this.newRecord = false;
      this.goal = { x: randomTile(), y: randomTile() };
      this.scene = "GAME";
    }
    // Boost toggles double speed while there is energy left.
    toggleTurbo() {
      const p = this.player;
      if (this.scene !== "GAME" || p.dead) return;
      if (p.turbo) {
        p.turbo = false;
        return;
      }
      if (p.energy > 0 && !p.stealthed) {
        p.turbo = true;
        play("boost", 0.2);
      }
    }
    // Shield (stealth in the original) makes the ship immune to thirteens until the energy runs out.
    activateShield() {
      const p = this.player;
      if (this.scene !== "GAME" || p.dead) return;
      if (p.energy > 0 && !p.turbo && !p.stealthed) {
        p.stealthed = true;
        play("shield", 0.25);
      }
    }
    updateEnergy() {
      const p = this.player;
      if (p.turbo) {
        p.energy -= 1;
        if (p.energy <= 0) {
          p.energy = 0;
          p.turbo = false;
        }
      } else if (p.stealthed) {
        p.energy -= 1.5;
        if (p.energy <= 0) {
          p.energy = 0;
          p.stealthed = false;
        }
      } else {
        p.energy = Math.min(100, p.energy + 0.5);
      }
    }
    movePlayer(dir) {
      const p = this.player;
      const speed = p.turbo ? p.speed * 2 : p.speed;
      let vx = dir.x * speed, vy = dir.y * speed;
      if (vx !== 0 && vy !== 0) {
        vx /= Math.SQRT2;
        vy /= Math.SQRT2;
      }
      p.x = Math.min(MAX_POS, Math.max(MIN_POS, p.x + vx));
      p.y = Math.min(MAX_POS, Math.max(MIN_POS, p.y + vy));
      if (dir.x !== 0 || dir.y !== 0) p.rotation = Math.atan2(dir.y, dir.x) + Math.PI / 2;
      this.updateEnergy();
    }
    checkThirteen() {
      const p = this.player;
      const row = Math.floor(p.y / TILE) - 1;
      const col = Math.floor(p.x / TILE) - 1;
      if (this.board.sum(col, row) === 13 && !p.stealthed) {
        p.dead = true;
        p.turbo = false;
        this.fireLasers(col, row);
        this.explode();
        play("explosion");
      }
    }
    fireLasers(col, row) {
      const cx = col * TILE + TILE * 1.5;
      const cy = row * TILE + TILE * 1.5;
      this.effects.push({ type: "laser", vertical: true, x: cx, y: TILE, length: cy + 32 - TILE, size: 4, t: 0 });
      this.effects.push({ type: "laser", vertical: false, x: TILE, y: cy, length: cx + 32 - TILE, size: 4, t: 0 });
    }
    explode() {
      const p = this.player;
      const particles = [];
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: p.x,
          y: p.y,
          radius: Math.random() * 20 + 10,
          green: Math.floor(Math.random() * 255),
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1
        });
      }
      this.effects.push({ type: "explosion", particles });
    }
    // One fixed 1/60 s step. `dir` is the requested movement direction (-1/0/1 per axis).
    update(dt, dir) {
      if (this.scene === "START") {
        this.board.update(dt);
        return;
      }
      if (this.scene !== "GAME") return;
      this.board.update(dt);
      for (const fx of this.effects) {
        if (fx.type === "laser") {
          fx.t += dt;
          fx.size = Math.min(48, fx.size + fx.size * dt * 12);
          fx.done = fx.t > 0.6;
        } else if (fx.type === "explosion") {
          for (const pt of fx.particles) {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.radius *= 0.97;
            pt.life -= 0.02;
          }
          fx.particles = fx.particles.filter((pt) => pt.life > 0);
          if (fx.particles.length === 0) {
            fx.done = true;
            this.endGame();
          }
        }
      }
      this.effects = this.effects.filter((fx) => !fx.done);
      const p = this.player;
      if (p.dead) return;
      this.movePlayer(dir);
      this.checkThirteen();
      if (p.dead) return;
      const gx = this.goal.x + 32, gy = this.goal.y + 32;
      if (Math.hypot(p.x - gx, p.y - gy) < 32) {
        this.score += 1;
        this.goal = { x: randomTile(), y: randomTile() };
        play("pickup", 0.2);
        if (this.score === this.level * 5) {
          this.level += 1;
          this.board.level = this.level;
          play("levelup", 0.3);
        }
      }
    }
    endGame() {
      if (this.scene !== "GAME") return;
      this.scene = "GAME_OVER";
      this.board.silent = true;
      if (this.score > this.best) {
        this.newRecord = this.score > 0;
        this.best = this.score;
        try {
          localStorage.setItem(BEST_KEY, String(this.best));
        } catch (e) {
        }
      }
      if (this.onGameOver) this.onGameOver();
    }
    renderGoal(ctx3) {
      const r = 32, x = this.goal.x, y = this.goal.y;
      ctx3.fillStyle = "rgba(0, 0, 0, 0.33)";
      ctx3.beginPath();
      ctx3.arc(x + r, y + r, r, 0, Math.PI * 2);
      ctx3.fill();
      const gradient = ctx3.createRadialGradient(x + r / 1.3, y + r / 1.3, 0, x, y, r * 2);
      gradient.addColorStop(0, "rgba(237, 192, 109, 1)");
      gradient.addColorStop(1, "rgba(237, 192, 109, 0)");
      ctx3.fillStyle = gradient;
      ctx3.beginPath();
      ctx3.arc(x + r, y + r, r, 0, Math.PI * 2);
      ctx3.fill();
    }
    renderPlayer(ctx3, time2) {
      const p = this.player;
      ctx3.save();
      ctx3.translate(p.x, p.y);
      if (p.stealthed) {
        ctx3.globalAlpha = 0.5;
        ctx3.strokeStyle = `rgba(120, 200, 255, ${0.5 + 0.3 * Math.sin(time2 * 20)})`;
        ctx3.lineWidth = 3;
        ctx3.beginPath();
        ctx3.arc(0, 0, 30, 0, Math.PI * 2);
        ctx3.stroke();
      }
      ctx3.rotate(p.rotation);
      if (p.turbo) {
        const flicker = 6 + Math.random() * 8;
        ctx3.fillStyle = "rgba(255, 170, 60, 0.85)";
        ctx3.beginPath();
        ctx3.moveTo(-10, 26);
        ctx3.lineTo(-4, 26 + flicker);
        ctx3.lineTo(2, 26);
        ctx3.moveTo(-2, 26);
        ctx3.lineTo(4, 26 + flicker);
        ctx3.lineTo(10, 26);
        ctx3.fill();
      }
      ctx3.drawImage(this.image, 128, 0, TILE, TILE, -32, -32, TILE, TILE);
      ctx3.restore();
    }
    renderEffects(ctx3) {
      for (const fx of this.effects) {
        if (fx.type === "laser") {
          ctx3.fillStyle = `rgba(170, 77, 141, ${Math.max(0, Math.min(1, (0.6 - fx.t) / 0.3))})`;
          if (fx.vertical) ctx3.fillRect(fx.x - fx.size / 2, fx.y, fx.size, fx.length);
          else ctx3.fillRect(fx.x, fx.y - fx.size / 2, fx.length, fx.size);
        } else if (fx.type === "explosion") {
          for (const pt of fx.particles) {
            ctx3.fillStyle = `rgba(255, ${pt.green}, 0, ${pt.life})`;
            ctx3.beginPath();
            ctx3.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx3.fill();
          }
        }
      }
    }
    // Bottom row of the board: stars, level and the energy bar ("E" box as in the original).
    renderHud(ctx3) {
      const y = 8 * TILE + 32;
      ctx3.textBaseline = "middle";
      ctx3.textAlign = "left";
      ctx3.font = "bold 22px Arial, Helvetica, sans-serif";
      ctx3.fillStyle = "#edc06d";
      ctx3.beginPath();
      ctx3.arc(TILE + 20, y, 11, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.fillStyle = "#fff";
      ctx3.fillText(String(this.score), TILE + 38, y + 1);
      ctx3.fillStyle = "#b9b3d6";
      ctx3.fillText(`LV ${this.level}`, TILE * 2 + 40, y + 1);
      const p = this.player;
      const bx = 64 * 6 + 28, bw = 96, bh = 32;
      ctx3.fillStyle = "#fff";
      ctx3.fillRect(bx - 32, y - bh / 2, bw + 36, bh + 4);
      ctx3.fillStyle = "#000";
      ctx3.fillRect(bx + 2, y - bh / 2 + 2, bw, bh);
      ctx3.fillStyle = p.stealthed ? "#78c8ff" : p.turbo ? "#e8a23c" : "#4a8cbd";
      ctx3.fillRect(bx + 2, y - bh / 2 + 2, bw * p.energy / 100, bh);
      ctx3.fillStyle = "#000";
      ctx3.font = "bold 20px Arial, Helvetica, sans-serif";
      ctx3.fillText("E", bx - 22, y + 2);
    }
    render(ctx3, time2) {
      this.board.render(ctx3);
      if (this.scene === "START") {
        this.renderGoal(ctx3);
        this.renderPlayer(ctx3, time2);
        return;
      }
      this.renderGoal(ctx3);
      this.renderEffects(ctx3);
      if (!this.player.dead) this.renderPlayer(ctx3, time2);
      this.renderHud(ctx3);
    }
  };

  // main.js
  var canvas = document.getElementById("game");
  var ctx2 = canvas.getContext("2d");
  var ui = {
    menu: document.getElementById("menu"),
    over: document.getElementById("over"),
    pause: document.getElementById("pause"),
    play: document.getElementById("play-btn"),
    again: document.getElementById("again-btn"),
    resume: document.getElementById("resume-btn"),
    mute: document.getElementById("mute-btn"),
    pauseBtn: document.getElementById("pause-btn"),
    finalScore: document.getElementById("final-score"),
    finalLevel: document.getElementById("final-level"),
    finalBest: document.getElementById("final-best"),
    record: document.getElementById("record"),
    menuBest: document.getElementById("menu-best")
  };
  var touchMode = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0 && !window.matchMedia("(pointer: fine)").matches;
  document.body.classList.toggle("touch", touchMode);
  var view = { w: 0, h: 0, dpr: 1, scale: 1, bx: 0, by: 0, size: 0 };
  var controls = { stick: { x: 0, y: 0, r: 56 }, boost: { x: 0, y: 0, r: 40 }, shield: { x: 0, y: 0, r: 40 } };
  var stars = null;
  function layout() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    view.w = w;
    view.h = h;
    view.dpr = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const pad = Math.max(6, Math.min(w, h) * 0.02);
    const portrait = h >= w;
    const topBar = 52;
    if (touchMode && portrait) {
      const band = Math.min(220, Math.max(150, h * 0.25));
      const size = Math.min(w - pad * 2, h - band - topBar - pad);
      view.size = size;
      view.bx = (w - size) / 2;
      const top = topBar + Math.max(0, (h - topBar - size - band) / 2);
      view.by = top;
      const cy = top + size + band / 2;
      const r = Math.min(62, band * 0.32);
      controls.stick = { x: Math.max(r + 24, w * 0.24), y: cy, r };
      const br = Math.min(44, band * 0.22);
      controls.boost = { x: w - br - 22, y: cy - br * 0.7, r: br };
      controls.shield = { x: w - br * 3 - 36, y: cy + br * 0.55, r: br };
    } else if (touchMode) {
      const band = Math.min(200, Math.max(130, w * 0.18));
      const size = Math.min(w - band * 2 - pad * 2, h - pad * 2);
      view.size = size;
      view.bx = (w - size) / 2;
      view.by = (h - size) / 2;
      const side = view.bx;
      const r = Math.min(58, side * 0.36);
      controls.stick = { x: side / 2, y: h * 0.62, r };
      const br = Math.min(40, side * 0.27, h * 0.1);
      controls.boost = { x: w - side / 2, y: h * 0.5, r: br };
      controls.shield = { x: w - side / 2, y: h * 0.5 + br * 2.5, r: br };
    } else {
      let size = Math.min(w - pad * 2, h - pad * 2);
      if ((w - size) / 2 < 110) size = Math.min(size, h - topBar * 2);
      view.size = size;
      view.bx = (w - size) / 2;
      view.by = (h - size) / 2;
    }
    view.scale = view.size / BOARD;
    makeStars();
  }
  function makeStars() {
    stars = document.createElement("canvas");
    stars.width = canvas.width;
    stars.height = canvas.height;
    const s = stars.getContext("2d");
    s.fillStyle = "#000";
    s.fillRect(0, 0, stars.width, stars.height);
    const count = Math.round(500 * (view.w * view.h) / (BOARD * BOARD) * 0.8);
    for (let i = 0; i < count; i++) {
      s.beginPath();
      s.arc(Math.random() * stars.width, Math.random() * stars.height, Math.random() * 2 * view.dpr * Math.max(0.7, view.scale), 0, Math.PI * 2);
      s.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
      s.fill();
    }
  }
  var keys = /* @__PURE__ */ new Set();
  var stick = { id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
  var prevPad = {};
  function keyDir() {
    const d = { x: 0, y: 0 };
    if (keys.has("ArrowUp") || keys.has("KeyW")) d.y = -1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) d.y = 1;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) d.x = -1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) d.x = 1;
    return d;
  }
  function stickDir() {
    const d = { x: 0, y: 0 };
    if (stick.id === null) return d;
    const len = Math.hypot(stick.dx, stick.dy);
    if (len < 12) return d;
    const nx = stick.dx / len, ny = stick.dy / len;
    if (nx > 0.38) d.x = 1;
    else if (nx < -0.38) d.x = -1;
    if (ny > 0.38) d.y = 1;
    else if (ny < -0.38) d.y = -1;
    return d;
  }
  function padInput() {
    const d = { x: 0, y: 0 };
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads && pads[0];
    if (!pad) return d;
    const b = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    if (b(12) || ay < -0.5) d.y = -1;
    if (b(13) || ay > 0.5) d.y = 1;
    if (b(14) || ax < -0.5) d.x = -1;
    if (b(15) || ax > 0.5) d.x = 1;
    const now = { south: b(0), west: b(2), start: b(9) };
    if (now.south && !prevPad.south) {
      if (game.scene === "GAME") game.toggleTurbo();
      else startGame();
    }
    if (now.west && !prevPad.west) game.activateShield();
    if (now.start && !prevPad.start) {
      if (game.scene === "GAME") togglePause();
      else startGame();
    }
    prevPad = now;
    return d;
  }
  function currentDir() {
    const k = keyDir(), s = stickDir(), p = padInput();
    return { x: k.x || s.x || p.x, y: k.y || s.y || p.y };
  }
  window.addEventListener("keydown", (e) => {
    unlockAudio();
    const code = e.code;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Enter"].includes(code)) e.preventDefault();
    if (e.repeat) {
      keys.add(code);
      return;
    }
    keys.add(code);
    if (code === "KeyM") {
      toggleMute();
      return;
    }
    if (paused) {
      if (["Enter", "Space", "KeyP", "Escape"].includes(code)) setPaused(false);
      return;
    }
    if (game.scene !== "GAME") {
      if (code === "Enter" || code === "Space") startGame();
      return;
    }
    if (code === "Space") game.toggleTurbo();
    else if (code === "ShiftLeft" || code === "ShiftRight" || code === "KeyC") game.activateShield();
    else if (code === "KeyP" || code === "Escape") togglePause();
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  window.addEventListener("blur", () => keys.clear());
  function hit(c, x, y) {
    return Math.hypot(x - c.x, y - c.y) <= c.r + 14;
  }
  var pressed = { boost: null, shield: null };
  canvas.addEventListener("pointerdown", (e) => {
    unlockAudio();
    if (e.pointerType === "touch" && !touchMode) {
      touchMode = true;
      document.body.classList.add("touch");
      layout();
    }
    if (game.scene !== "GAME" || paused) return;
    e.preventDefault();
    const x = e.clientX, y = e.clientY;
    if (touchMode && hit(controls.boost, x, y)) {
      pressed.boost = e.pointerId;
      game.toggleTurbo();
      return;
    }
    if (touchMode && hit(controls.shield, x, y)) {
      pressed.shield = e.pointerId;
      game.activateShield();
      return;
    }
    if (stick.id === null) {
      stick.id = e.pointerId;
      stick.ox = x;
      stick.oy = y;
      stick.dx = 0;
      stick.dy = 0;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {
      }
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== stick.id) return;
    let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy;
    const max = controls.stick.r;
    const len = Math.hypot(dx, dy);
    if (len > max * 1.4) {
      stick.ox += dx * (1 - max * 1.4 / len);
      stick.oy += dy * (1 - max * 1.4 / len);
      dx = e.clientX - stick.ox;
      dy = e.clientY - stick.oy;
    }
    stick.dx = dx;
    stick.dy = dy;
  });
  function releasePointer(e) {
    if (e.pointerId === stick.id) {
      stick.id = null;
      stick.dx = stick.dy = 0;
    }
    if (e.pointerId === pressed.boost) pressed.boost = null;
    if (e.pointerId === pressed.shield) pressed.shield = null;
  }
  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  var paused = false;
  function show(el, visible) {
    el.classList.toggle("hidden", !visible);
  }
  function startGame() {
    unlockAudio();
    setPaused(false);
    game.start();
    show(ui.menu, false);
    show(ui.over, false);
    show(ui.pauseBtn, true);
  }
  function setPaused(value) {
    paused = value && game.scene === "GAME";
    show(ui.pause, paused);
    stick.id = null;
    stick.dx = stick.dy = 0;
    keys.clear();
  }
  function togglePause() {
    setPaused(!paused);
  }
  function toggleMute() {
    setMuted(!isMuted());
    updateMuteButton();
  }
  function updateMuteButton() {
    ui.mute.classList.toggle("muted", isMuted());
    ui.mute.setAttribute("aria-label", isMuted() ? "Unmute sound" : "Mute sound");
  }
  ui.play.addEventListener("click", startGame);
  ui.again.addEventListener("click", startGame);
  ui.resume.addEventListener("click", () => {
    unlockAudio();
    setPaused(false);
  });
  ui.mute.addEventListener("click", () => {
    unlockAudio();
    toggleMute();
    ui.mute.blur();
  });
  ui.pauseBtn.addEventListener("click", () => {
    togglePause();
    ui.pauseBtn.blur();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused(true);
    last = performance.now();
  });
  var image = new Image();
  image.src = "square.png";
  var game = new Game(image);
  game.onGameOver = () => {
    ui.finalScore.textContent = String(game.score);
    ui.finalLevel.textContent = String(game.level);
    ui.finalBest.textContent = String(game.best);
    show(ui.record, game.newRecord);
    ui.menuBest.textContent = String(game.best);
    show(ui.pauseBtn, false);
    show(ui.over, true);
  };
  ui.menuBest.textContent = String(game.best);
  updateMuteButton();
  var STEP = 1 / 60;
  var last = performance.now();
  var acc = 0;
  var time = 0;
  function drawControls() {
    if (!touchMode || game.scene !== "GAME" || paused) return;
    ctx2.save();
    ctx2.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    const s = controls.stick;
    const bx = stick.id !== null ? stick.ox : s.x;
    const by = stick.id !== null ? stick.oy : s.y;
    ctx2.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx2.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx2.lineWidth = 2;
    ctx2.beginPath();
    ctx2.arc(bx, by, s.r, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.stroke();
    let kx = 0, ky = 0;
    if (stick.id !== null) {
      const len = Math.hypot(stick.dx, stick.dy) || 1;
      const m = Math.min(len, s.r);
      kx = stick.dx / len * m;
      ky = stick.dy / len * m;
    }
    ctx2.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx2.beginPath();
    ctx2.arc(bx + kx, by + ky, s.r * 0.45, 0, Math.PI * 2);
    ctx2.fill();
    if (stick.id === null) {
      ctx2.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx2.font = "bold 13px Arial, Helvetica, sans-serif";
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.fillText("DRAG", bx, by);
    }
    const p = game.player;
    const button = (c, label, active, color) => {
      ctx2.fillStyle = active ? color : "rgba(255, 255, 255, 0.1)";
      ctx2.strokeStyle = active ? "#fff" : "rgba(255, 255, 255, 0.45)";
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
      ctx2.fillStyle = "#fff";
      ctx2.font = `bold ${Math.round(c.r * 0.34)}px Arial, Helvetica, sans-serif`;
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.fillText(label, c.x, c.y);
    };
    button(controls.boost, "BOOST", p.turbo, "rgba(232, 162, 60, 0.6)");
    button(controls.shield, "SHIELD", p.stealthed, "rgba(120, 200, 255, 0.55)");
    ctx2.restore();
  }
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1e3;
    last = now;
    if (dt > 0.25) dt = 0.25;
    if (!paused) {
      acc += dt;
      while (acc >= STEP) {
        game.update(STEP, game.scene === "GAME" ? currentDir() : { x: 0, y: 0 });
        if (game.scene !== "GAME") padInput();
        acc -= STEP;
        time += STEP;
      }
    }
    ctx2.setTransform(1, 0, 0, 1, 0, 0);
    ctx2.drawImage(stars, 0, 0);
    const k = view.dpr * view.scale;
    ctx2.setTransform(k, 0, 0, k, view.bx * view.dpr, view.by * view.dpr);
    ctx2.imageSmoothingEnabled = false;
    if (image.complete && image.naturalWidth) game.render(ctx2, time);
    drawControls();
  }
  layout();
  window.addEventListener("resize", layout);
  window.addEventListener("orientationchange", () => setTimeout(layout, 100));
  if (window.visualViewport) window.visualViewport.addEventListener("resize", layout);
  requestAnimationFrame(frame);
  window.__game = game;
})();
