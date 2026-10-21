// Genera una animación Lottie de destellos dorados (estallido al romper el lacre).
import { writeFileSync } from "node:fs";

const W = 400, H = 400, C = 200, FPS = 60, FIN = 90;
const ORO = [201 / 255, 164 / 255, 92 / 255, 1];
const ORO_CLARO = [1, 243 / 255, 207 / 255, 1];
const BORDO = [140 / 255, 35 / 255, 51 / 255, 1];

const ease = { i: { x: [0.2], y: [1] }, o: { x: [0.6], y: [0] } };
const k = (t, s, e = true) => (e ? { t, s, ...ease } : { t, s });
const fijo = (v) => ({ a: 0, k: v });
const anim = (...kfs) => ({ a: 1, k: kfs });

const transformGrupo = {
  ty: "tr", p: fijo([0, 0]), a: fijo([0, 0]), s: fijo([100, 100]), r: fijo(0), o: fijo(100), sk: fijo(0), sa: fijo(0), nm: "t",
};

let ind = 1;
const capa = (nm, ks, shapes) => ({
  ddd: 0, ind: ind++, ty: 4, nm, sr: 1, ks, ao: 0, shapes, ip: 0, op: FIN, st: 0, bm: 0,
});
const ks = ({ o, r = fijo(0), p, s }) => ({ o, r, p, a: fijo([0, 0, 0]), s });

const estrella = (radio, color) => ({
  ty: "gr", nm: "estrella",
  it: [
    { ty: "sr", sy: 1, d: 1, pt: fijo(4), p: fijo([0, 0]), r: fijo(0), ir: fijo(radio * 0.28), is: fijo(0), or: fijo(radio), os: fijo(0), ix: 1, nm: "sr" },
    { ty: "fl", c: fijo(color), o: fijo(100), r: 1, nm: "fl" },
    transformGrupo,
  ],
});

const capas = [];

// Destellos que salen en todas direcciones
const N = 14;
for (let i = 0; i < N; i++) {
  const ang = (i / N) * Math.PI * 2 + (i % 2) * 0.2;
  const dist = i % 2 ? 150 : 115;
  const x = C + Math.cos(ang) * dist, y = C + Math.sin(ang) * dist;
  const ini = (i % 3) * 3;
  const tam = i % 2 ? 9 : 14;
  capas.push(
    capa(`destello-${i}`, ks({
      o: anim(k(ini, [0]), k(ini + 8, [100]), k(ini + 45, [90]), k(ini + 70, [0], false)),
      r: anim(k(ini, [0]), k(ini + 70, [i % 2 ? 90 : -90], false)),
      p: anim(k(ini, [C, C, 0]), k(ini + 50, [x, y, 0], false)),
      s: anim(k(ini, [0, 0, 100]), k(ini + 14, [120, 120, 100]), k(ini + 70, [30, 30, 100], false)),
    }), [estrella(tam, i % 3 === 0 ? ORO_CLARO : ORO)])
  );
}

// Anillo dorado que se expande
capas.push(
  capa("anillo", ks({
    o: anim(k(0, [90]), k(45, [0], false)),
    p: fijo([C, C, 0]),
    s: fijo([100, 100, 100]),
  }), [{
    ty: "gr", nm: "anillo",
    it: [
      { ty: "el", d: 1, s: anim(k(0, [40, 40]), k(45, [340, 340], false)), p: fijo([0, 0]), nm: "el" },
      { ty: "st", c: fijo(ORO), o: fijo(100), w: anim(k(0, [6]), k(45, [0.5], false)), lc: 2, lj: 2, nm: "st" },
      transformGrupo,
    ],
  }])
);

// Esquirlas de lacre que caen
for (let i = 0; i < 6; i++) {
  const dx = (i - 2.5) * 34;
  capas.push(
    capa(`esquirla-${i}`, ks({
      o: anim(k(0, [100]), k(60, [100]), k(80, [0], false)),
      r: anim(k(0, [0]), k(80, [i % 2 ? 160 : -160], false)),
      p: anim({ t: 0, s: [C, C, 0], i: { x: [0.4], y: [0] }, o: { x: [0.3], y: [0.6] } }, k(80, [C + dx, C + 170 + (i % 3) * 20, 0], false)),
      s: fijo([100, 100, 100]),
    }), [{
      ty: "gr", nm: "esquirla",
      it: [
        { ty: "sr", sy: 2, d: 1, pt: fijo(3 + (i % 3)), p: fijo([0, 0]), r: fijo(0), or: fijo(7 + (i % 3) * 2), os: fijo(0), ix: 1, nm: "pol" },
        { ty: "fl", c: fijo(BORDO), o: fijo(100), r: 1, nm: "fl" },
        transformGrupo,
      ],
    }])
  );
}

const lottie = { v: "5.7.4", fr: FPS, ip: 0, op: FIN, w: W, h: H, nm: "destellos", ddd: 0, assets: [], layers: capas };
writeFileSync(process.argv[2], JSON.stringify(lottie));
console.log("ok", capas.length, "capas");
