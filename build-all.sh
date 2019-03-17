wasm-pack build
cd www
npm install
npm run build
find dist -type f ! -name '*.ico' ! -name '*.woff' ! -name '*.woff2' ! -name '*.pdf' -exec zopfli '{}' \;
