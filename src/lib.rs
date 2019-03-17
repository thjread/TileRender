extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use std::ops;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Vec2d {
    x: f32,
    y: f32,
}

impl Vec2d {
    fn length(self) -> f32 {
        (self.x*self.x+self.y*self.y).sqrt()
    }

    fn normalize(self) -> Vec2d {
        self/self.length()
    }

    fn dot(self, other: Vec2d) -> f32 {
        self.x*other.x + self.y*other.y
    }
}

impl ops::Add<Vec2d> for Vec2d {
    type Output = Vec2d;

    fn add(self, rhs: Vec2d) -> Vec2d {
        Vec2d {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}

impl ops::Sub<Vec2d> for Vec2d {
    type Output = Vec2d;

    fn sub(self, rhs: Vec2d) -> Vec2d {
        Vec2d {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}

impl ops::Mul<f32> for Vec2d {
    type Output = Vec2d;

    fn mul(self, rhs: f32) -> Vec2d {
        Vec2d {
            x: self.x*rhs,
            y: self.y*rhs
        }
    }
}

impl ops::Div<f32> for Vec2d {
    type Output = Vec2d;

    fn div(self, rhs: f32) -> Vec2d {
        Vec2d {
            x: self.x/rhs,
            y: self.y/rhs
        }
    }
}

#[derive(Debug, Clone, Copy)]
struct Line {
    from: Vec2d,
    to: Vec2d,
}

impl Line {
    fn length(self) -> f32 {
        (self.from-self.to).length()
    }
}

#[derive(Debug, Clone, Copy)]
pub struct LineMeta {
    line: Line,
    dir: Vec2d,// unit vector in direction from -> to
    normal: Vec2d,// unit vector perpendicular to dir
}

static TEXT: &[Line] = &[Line{from: Vec2d{x: 0f32, y: 0f32}, to: Vec2d{x:1f32, y: 0f32}}];

impl From<Line> for LineMeta {
    fn from(line: Line) -> LineMeta {
        let dir = (line.from-line.to).normalize();
        let normal = Vec2d {x: -dir.y, y: dir.x};
        LineMeta {
            line,
            dir,
            normal,
        }
    }
}

fn line_hits_segment(l: LineMeta, s: Line) -> bool {
    let dist_from = (s.from-l.line.from).dot(l.normal);
    let dist_to = (s.to-l.line.from).dot(l.normal);
    return dist_from * dist_to < 0.0;
}

fn ray_to_line_distance(r: LineMeta, l: LineMeta) -> f32 {
    let dist = (l.line.from-r.line.from).dot(l.normal);
    let distance_along_ray = dist/l.normal.dot(r.dir);
    distance_along_ray
}

fn ray_hits_segment(r: LineMeta, s: LineMeta) -> bool {
    return line_hits_segment(r, s.line) && ray_to_line_distance(r, s) > 0.0
}

fn min_distance_to_segment(p: Vec2d, s: LineMeta) -> f32 {
    let ray = LineMeta::from(Line { from: p, to: p+s.normal });
    if line_hits_segment(ray, s.line) {
        s.normal.dot(p-s.line.from).abs()
    } else {
        let d_from = (p-s.line.from).length();
        let d_to = (p-s.line.to).length();
        d_from.min(d_to)
    }
}

#[wasm_bindgen]
pub fn process_text() -> Vec<LineMeta> {
    TEXT.into_iter().filter(|l| (*l).length() > 0.0).map(|l| LineMeta::from(*l)).collect()
}

#[wasm_bindgen]
pub fn in_text(p: Vec2d, text: &Vec<LineMeta>) -> (bool, f32) {
    assert!(text.len() > 0);

    let ray: LineMeta = LineMeta::from(Line { from: p, to: p + Vec2d { x: 1.0, y: 0.0 } });
    let mut hits = 0;
    let mut min_dist = None;
    for &s in text {
        if ray_hits_segment(ray, s) {
            hits += 1;
        }
        let dist = min_distance_to_segment(p, s);
        min_dist = match min_dist {
            None => Some(dist),
            Some(d) => Some(d.min(dist))
        }
    }
    let in_interior = hits % 2 == 1;
    (in_interior, min_dist.unwrap())
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-thjread!");
}
