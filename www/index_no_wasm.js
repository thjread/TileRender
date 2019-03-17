import text from "./text.js";

/*function intersect(lineA, lineB) {
    function lineLength(line) {
        return Math.sqrt(line[0]*line[0]+line[1]*line[1]);
    }

    let lineADir = [lineA[1][0]-lineA[0][0], lineA[1][1]-lineA[0][1]];
    const lineADirLen = lineLength(lineADir);
    lineADir = [lineADir[0]/lineADirLen, lineADir[1]/lineADirLen];
    let lineBDir = [lineB[1][0]-lineB[0][0], lineB[1][1]-lineB[0][1]];
    const lineBDirLen = lineLength(lineBDir);
    lineBDir = [lineBDir[0]/lineBDirLen, lineBDir[1]/lineBDirLen];
    const lineAN = [-lineADir[1], lineADir[0]];
    const dist = (lineB[1][0]-lineA[1][0])*lineAN[0] + (lineB[1][1]-lineA[1][1])*lineAN[1];
    const t = -dist / (lineBDir[0]*lineAN[0] + lineBDir[1]*lineAN[1]);
    return [lineB[1][0] + lineBDir[0]*t, lineB[1][1] + lineBDir[1]*t];
}*/

function segmentLength(segment) {
    return Math.sqrt(segment[0]*segment[0]+segment[1]*segment[1]);
}

function lineHitsSegment(line, segment) {
    let lineDir = [line[1][0]-line[0][0], line[1][1]-line[0][1]];
    const lineN = [-lineDir[1], lineDir[0]];
    const distA = (segment[1][0]-line[1][0])*lineN[0] + (segment[1][1]-line[1][1])*lineN[1];
    const distB = (segment[0][0]-line[1][0])*lineN[0] + (segment[0][1]-line[1][1])*lineN[1];
    return distA * distB < 0;
}

function rayToLineDistance(ray, line) {
    let rayDir = [ray[1][0]-ray[0][0], ray[1][1]-ray[0][1]];
    const rayDirLen = Math.sqrt(rayDir[0]*rayDir[0] + rayDir[1]*rayDir[1]);
    rayDir = [rayDir[0]/rayDirLen, rayDir[1]/rayDirLen];

    let lineDir = [line[1][0]-line[0][0], line[1][1]-line[0][1]];
    const lineDirLen = segmentLength(lineDir)
    lineDir = [lineDir[0]/lineDirLen, lineDir[1]/lineDirLen];

    const lineN = [-lineDir[1], lineDir[0]];
    const distC = (line[1][0]-ray[0][0])*lineN[0] + (line[1][1]-ray[0][1])*lineN[1];
    const distance = distC/(lineN[0]*rayDir[0] + lineN[1]*rayDir[1]);
    return distance;
}

// ray starts at ray[0], continues in direction ray[1] - ray[0]
function hitTest(ray, segment) {
    const hitsSegment = lineHitsSegment(ray, segment);
    const distance = rayToLineDistance(ray, segment);
    return hitsSegment && distance > 0;
}

function minDistance(point, segment) {
    let segmentDir = [segment[1][0]-segment[0][0], segment[1][1]-segment[0][1]];
    let ray = [point, [point[0]-segmentDir[1], point[1]+segmentDir[0]]];
    if (lineHitsSegment(ray, segment)) {
        const segmentDirLen = segmentLength(segmentDir);
        const segmentN = [-segmentDir[1]/segmentDirLen, segmentDir[0]/segmentDirLen];
        const dist = segmentN[0]*(point[0]-segment[0][0]) + segmentN[1]*(point[1]-segment[0][1]);
        // or just Math.abs(rayToLineDistance(ray, segment))
        return {
            dist: Math.abs(dist),
            nearest: [point[0]-dist*segmentN[0], point[1]-dist*segmentN[1]]
        }
    } else {
        const d0 = segmentLength([segment[0][0]-point[0], segment[0][1]-point[1]]);
        const d1 = segmentLength([segment[1][0]-point[0], segment[1][1]-point[1]]);
        if (d0 < d1) {
            return {
                dist: d0,
                nearest: segment[0]
            }
        } else {
            return {
                dist: d1,
                nearest: segment[1]
            }
        }
    }
}

function inText(coord) {
    let ray = [coord, [coord[0]+1, coord[1]]]
    let hits = 0;
    let minDist = -1;
    let nearest = [0,0];
    for (let i=0; i<text.length; ++i) {
        const segment = [text[i][0], text[i][1]];
        const hit = hitTest(ray, segment);
        const dist = minDistance(coord, segment);
        if (hit) {
            hits += 1;
        }
        if (minDist < 0 || (dist.dist !== NaN && minDist > dist.dist)) {
            minDist = dist.dist;
            nearest = dist.nearest;
        }
    }
    return {
        hit: hits % 2 === 1,
        minDistance: minDist,
        nearest: nearest
    }
}

let fineness = 1;
let canvas;
let width;
let height;
let ctx;

let patches = [[0, 0, 128, 128, 1],
               [128, 0, 128, 128, 1]];
let patchIndex = 0;

const MAX_GEN = 11;

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
    const res = inText([x+w/2, y+h/2]);
    const col_delta = Math.pow(0.5, gen/4+0.75);
    ctx.fillStyle = colFromGen(gen, res.hit);
    ctx.strokeStyle = "rgb(128,128,128)"
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.rect(x*scale, y*scale, w*scale, h*scale);
    ctx.fill();
    ctx.stroke();
    /*ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.moveTo((x+w/2)*scale, (y+w/2)*scale);
    ctx.lineTo(res.nearest[0]*scale, res.nearest[1]*scale);
    ctx.stroke();*/ // TODO put these on a second layer, clear each generation
    if (res.minDistance * res.minDistance < (w*w + h*h)/4) {
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

window.onload = function () {
    canvas = document.getElementById("thjread-canvas");
    width = window.innerWidth;
    height = window.innerHeight;
    if (height <= width) {
        if (height > width/2) {
            height = width/2;
        } else {
            width = height*2;
        }
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d", {alpha: false});
    } else {
        width = window.innerHeight;
        height = window.innerWidth;
        if (height > width/2) {
            height = width/2;
        } else {
            width = height*2;
        }
        canvas.width = height;
        canvas.height = width;
        ctx = canvas.getContext("2d", {alpha: false});
        ctx.rotate(3.1415926/2);
        ctx.translate(0, -height);
    }
    ctx.fillStyle = "rgb(127,127,127)"
    ctx.fillRect(0, 0, width, height);
    window.requestAnimationFrame(draw)

}
