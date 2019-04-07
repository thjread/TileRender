# TileRender

**A pretty animation that serves as the homepage for <https://thjread.com>.**

![Screenshot of thjread.com](docs/images/thjread.png)

### How it works

I created a polygonal path (in this case the outline of the word ``thjread``) in Inkscape, and extracted the path coordinates from the resulting SVG file using a hacky Python script. 

The path is rendered (onto a ``<canvas>`` element) by starting with a coarse grid, colouring the grid cells according to whether the centre of the cell is inside or outside the path, and then recursively subdividing all the cells that the path passes through. To check if a point is inside the path, the program casts a ray out from that point, and checks if the ray intersects the path an odd number of times. The most performance sensitive parts of the code (checking if a point is inside the path, and calculating the closest distance from a point to the path) are written in [Rust](https://www.rust-lang.org/), and run in the browser using [WebAssembly](https://webassembly.org/).

### Running

Requires:

* [npm](https://www.npmjs.com/)
* [Rust](https://www.rust-lang.org/)
* [wasm-pack](https://github.com/rustwasm/wasm-pack)

``sh run-local.sh`` will start an npm development server on ``localhost:8080``.

Production NGINX server configuration can be seen at <https://github.com/thjread/thjread>.
