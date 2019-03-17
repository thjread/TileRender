import {in_text, Vec2d} from "wasm-thjread";

let fineness = 1;
let canvas;
let width;
let height;
let ctx;

let patches = [[0, 0, 128, 128, 1],
               [128, 0, 128, 128, 1]];
let patchIndex = 0;

const MAX_GEN = 10;

function colFromGen(gen, hit) {
    const col_delta = Math.pow(0.5, gen/5+0.8);
    let col;
    if (hit) {
        col = Math.floor(col_delta*255);
    } else {
        col = Math.floor((1-col_delta)*255);
    }
    return "rgb("+col+","+col+","+col+")";
}

function drawPatch(x, y, w, h, gen) {
    const scale = width/256;
    const p = new Vec2d(x+w/2, y+h/2);
    const res = in_text(p);
    const hit = res.get_hit();
    const minDist = res.get_dist();
    const col_delta = Math.pow(0.5, gen/4+0.75);
    ctx.fillStyle = colFromGen(gen, hit);
    ctx.beginPath();
    ctx.rect(x*scale, y*scale, w*scale, h*scale);
    ctx.fill();
    ctx.stroke();
    if (minDist*minDist < (w*w + h*h)/4) {
        patches.push([x, y, w/2, h/2, gen+1]);
        patches.push([x, y+h/2, w/2, h/2, gen+1]);
        patches.push([x+w/2, y, w/2, h/2, gen+1]);
        patches.push([x+w/2, y+h/2, w/2, h/2, gen+1]);
    }
}

function drawNextPatch() {
    if (patchIndex < patches.length) {
        const patch = patches[patchIndex]
        if(patch[4] > MAX_GEN) {
            return 0;
        }
        drawPatch(patch[0], patch[1], patch[2], patch[3], patch[4]);
        patchIndex++;
        return 500/(Math.sqrt(patch[4])*Math.pow(2.25, patch[4]));
    } else {
        return 0;
    }
}

let lastTime;

function draw(time) {
    if (!lastTime) {
        lastTime = time;
    }
    let budget = time-lastTime;
    let its = 0;
    while (budget > 0 && its < 100) {
        const result = drawNextPatch();
        if (result === 0) {
            return;
        } else {
            budget -= result;
        }
        its++;
    }
    if (budget > -20) {
        window.requestAnimationFrame(draw);
    } else {
        window.setTimeout(function() {
            draw(time-budget);
        }, -budget);
    }
    lastTime = time;
}

function init() {
    canvas = document.getElementById("thjread-canvas");
    width = window.innerWidth;
    height = window.innerHeight;
    if (height > width/2) {
        height = width/2;
    } else {
        width = height*2;
    }
    let dpr = window.devicePixelRatio || 1;
    canvas.width = width*dpr;
    canvas.height = height*dpr;

    ctx = canvas.getContext("2d", {alpha: false});
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "rgb(128,128,128)"
    ctx.lineWidth = 0.5;
    ctx.fillStyle = "rgb(127,127,127)"
    ctx.fillRect(0, 0, width, height);
    window.requestAnimationFrame(draw)
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
