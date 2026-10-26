import {
  CLOCK,
  idealPoint,
  interceptDeficit,
  type QuadratrixState,
  quadratrixMotion,
  quadratrixVerdict,
  rotationDuration,
} from "./core/quadratrix";
import { escapeHtml as esc } from "./html";

export const decimal = (n: number): string =>
  n !== 0 && Math.abs(n) < 0.00001 ? n.toExponential(6) : n.toFixed(8).replace(/\.?0+$/, "");
const xy = (x: number, y: number): string =>
  `${(100 + 440 * x).toFixed(4)},${(520 - 440 * y).toFixed(4)}`;
const line = (x1: number, y1: number, x2: number, y2: number, cls: string): string => {
  const [a, b] = xy(x1, y1).split(","),
    [c, d] = xy(x2, y2).split(",");
  return `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${cls}"/>`;
};
export function quadratrixPlate(s: QuadratrixState): string {
  const m = quadratrixMotion(s);
  const reference = Array.from({ length: 201 }, (_, i) => {
    const p = idealPoint(Math.max(1e-6, 1 - i / 200));
    return `${i ? "L" : "M"}${xy(p.x, p.y)}`;
  }).join(" ");
  const trace: string[] = [];
  for (let i = 0; i <= 250; i++) {
    const tick = Math.round((s.tick * i) / 250);
    const p = quadratrixMotion({ ...s, tick: Math.min(tick, CLOCK - 1) });
    if (p.point) trace.push(`${trace.length ? "L" : "M"}${xy(p.point.x, p.point.y)}`);
  }
  const point =
    m.point && m.inSquare
      ? `<circle cx="${100 + m.point.x * 440}" cy="${520 - m.point.y * 440}" r="6" class="qx-z"/><text x="${116 + m.point.x * 440}" y="${509 - m.point.y * 440}" class="qx-label">Z</text>`
      : "";
  const ex = Math.cos(m.angle),
    ey = Math.sin(m.angle);
  const h = 100 + (440 * 2) / Math.PI;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 620" role="img" aria-labelledby="qx-plate-title qx-plate-desc"><title id="qx-plate-title">Two moving lines and the quadratrix</title><desc id="qx-plate-desc">Unit square A B Γ Δ. Equal axis scales. Time ${s.tick}/${CLOCK}; rotation duration ${rotationDuration(s.timing)}/${CLOCK}; height ${m.height}; angle ${m.angle} radians. ${esc(quadratrixVerdict(s))}${m.point ? ` Z = (${m.point.x}, ${m.point.y}).` : " No unique intersection coordinates."}${s.limit ? " The open ring H is a separately added limiting point, not the current intersection." : " The limiting point has not been added."}</desc><defs><clipPath id="qx-square-clip"><rect x="100" y="80" width="440" height="440"/></clipPath></defs><path d="M100,80 H540 V520 H100 Z" class="qx-square"/><path d="M100,80 A440,440 0 0 1 540,520" class="qx-arc"/><path d="${reference}" class="qx-reference"/><g clip-path="url(#qx-square-clip)"><path d="${trace.join(" ")}" class="qx-trace"/>${line(0, m.height, 1, m.height, "qx-slider")}${line(0, 0, 2 * ex, 2 * ey, "qx-ray")}</g>${m.kind === "coincident" ? line(0, 0, 1, 0, "qx-coincident") : ""}<circle cx="100" cy="520" r="4" class="qx-origin"/><circle cx="${100 + ex * 440}" cy="${520 - ey * 440}" r="5" class="qx-e"/><rect x="94" y="${514 - m.height * 440}" width="12" height="12" class="qx-s"/>${point}<text x="73" y="550" class="qx-label">A</text><text x="73" y="65" class="qx-label">B</text><text x="550" y="65" class="qx-label">Γ</text><text x="552" y="550" class="qx-label">Δ</text><text x="${111 + ex * 440}" y="${512 - ey * 440}" class="qx-label">E</text><text x="55" y="${526 - m.height * 440}" class="qx-label">S</text>${s.limit ? `<circle cx="${h}" cy="520" r="8" class="qx-limit"/><path d="M${h},533 V558" class="qx-guide"/><text x="${h - 18}" y="582" class="qx-label">H</text><text x="${h + 7}" y="582" class="qx-small">limit</text>` : ""}<text x="100" y="29" class="qx-small">SIDE = 1 · SAME SCALE IN BOTH DIRECTIONS</text><text x="100" y="612" class="qx-small">${s.timing === "together" ? "Dashed: the synchronized reference curve; solid: motion so far." : "Dashed: synchronized reference. Solid: your changed timing."}</text></svg>`;
}

export function quadratrixNumbers(s: QuadratrixState): string {
  const m = quadratrixMotion(s);
  return `<dl class="qx-numbers"><div><dt>Slider height</dt><dd>${CLOCK - s.tick}/${CLOCK} = ${decimal(m.height)}</dd></div><div><dt>Remaining turn</dt><dd>${Math.max(0, rotationDuration(s.timing) - s.tick)}/${rotationDuration(s.timing)} of a right angle</dd></div><div><dt>Intersection Z</dt><dd>${m.point ? `(${decimal(m.point.x)}, ${decimal(m.point.y)})${m.inSquare ? "" : " · outside square"}` : m.kind === "parallel" ? "None · parallel lines" : "Not unique · coincident lines"}</dd></div>${s.timing === "together" && m.height > 0 ? `<div><dt>Distance still left in x</dt><dd>${decimal(interceptDeficit(m.height))}<small>to the theoretical intercept 2/π; computed stably</small></dd></div>` : ""}</dl>`;
}

export function quadratrixArgument(): string {
  return `<div class="qx-argument"><div><h3>The last instant is not a crossing</h3><p>Put A at (0, 0), B at (0, 1). With a fraction u of the synchronized journey left, the slider is at y = u and the rotating line makes θ = πu/2 with the baseline.</p><p>For u &gt; 0, their unique crossing has<br><strong>x = u cot(πu/2), y = u.</strong></p><p>At u = 0, substituting into this expression gives an undefined product. The line equations give y = 0 twice. They do not give x = 2/π.</p></div><div><h3>A separate argument adds H</h3><p>For 0 &lt; θ &lt; π/2, the unit-circle triangle and sector comparison gives sin θ &lt; θ &lt; tan θ. Hence</p><p class="qx-equation">cos θ &lt; θ cot θ &lt; 1.</p><p>Both bounds tend to 1 as θ tends to zero. Since x = (2/π) θ cot θ, the positive-time crossings approach <strong>H = (2/π, 0)</strong>.</p><p>This is a modern limit argument. It justifies a continuous extension of the curve; it does not turn the final coincident lines into one crossing. Pappus’s geometric proof is retained on pp.256–259.</p></div></div>`;
}

export function quadratrixApproach(): string {
  return `<div class="qx-table-scroll" tabindex="0" role="region" aria-label="Approach to the synchronized endpoint"><table><caption>Synchronized motion · unit side · decimal approximations</caption><thead><tr><th scope="col">Time left u</th><th scope="col">Crossing x</th><th scope="col">2/π − x</th><th scope="col">Line relation</th></tr></thead><tbody>${[0.5, 0.1, 0.01, 0.000001].map((u) => `<tr><th scope="row">${decimal(u)}</th><td>${decimal(idealPoint(u).x)}</td><td>${decimal(interceptDeficit(u))}</td><td>One crossing</td></tr>`).join("")}<tr><th scope="row">Exactly 0</th><td>No unique x</td><td>Not a crossing</td><td>Coincident</td></tr><tr><th scope="row">Limit, added separately</th><td>2/π ≈ ${decimal(2 / Math.PI)}</td><td>0</td><td>Continuous extension</td></tr></tbody></table></div>`;
}

export function quadratrixSquare(): string {
  return `<div class="qx-argument"><div><h3>From intercept to quarter-circle</h3><p>Keep the unit side AB = 1. If AH = 2/π is supplied by the extended curve, the proportion is</p><p class="qx-equation">AH : AB = AB : L,<br>L = 1/AH = π/2.</p><p>L is the straight length equal to the quarter-circle arc. Four copies give C = 2π. This step consumes the intercept; it does not obtain it by a straightedge and compass.</p></div><div><h3>From circumference to equal area</h3><p>A unit circle has the area of a right triangle with base C and height 1. The equivalent rectangle has sides C/2 and 1; a mean proportional gives square side √(C/2) = √π.</p><p>Pappus invokes Archimedes for the area step on pp.258–259. <a href="./quadrature.html">Euclid II.14</a> explains the rectangle-to-square construction. A numerical √π computed by this program is not a straightedge-and-compass squaring of the circle.</p></div></div>`;
}
