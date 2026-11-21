// After `next build`: the static export writes per-segment prefetch files as nested folders
// (languages/__next.languages/__PAGE__.txt), but the client router requests flat names
// (languages/__next.languages.__PAGE__.txt). GitHub Pages then answers 404 and the router falls
// back to the full payload. This copies every nested file to the flat name it is requested by.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(dir, p, name);
    else walk(p);
  }
}

// Every file under `seg` (a __next.* folder in `parent`) gets a copy in `parent` whose name is its
// path from the folder, joined with dots.
function flatten(parent, seg, prefix) {
  for (const name of readdirSync(seg)) {
    const p = join(seg, name);
    const flat = `${prefix}.${name}`;
    if (statSync(p).isDirectory()) flatten(parent, p, flat);
    else {
      copyFileSync(p, join(parent, flat));
      copied++;
    }
  }
}

walk(OUT);
console.log(`flatten-segments: ${copied} prefetch files copied to their requested names`);
