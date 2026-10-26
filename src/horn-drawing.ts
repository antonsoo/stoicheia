import { approximate, exact } from "./core/circle";
import { type HornState, hornWitness } from "./core/horn";

const n = (x: number) => Number(x.toPrecision(12));
const lower = (x: number) => (x * x) / (1 + Math.sqrt(Math.max(0, 1 - x * x)));
export function hornCropWidth(s: HornState): number {
  if (s.rise <= 0) return 0.3;
  const w = hornWitness(s);
  return 8 * (approximate(w.foot.y) - lower(approximate(w.foot.x)));
}
export function hornScaleCaption(s: HornState): string {
  const width = hornCropWidth(s);
  return `Crop width ${width.toExponential(4)} radii; scale bar ${(width / 5).toExponential(4)} radii. Horizontal and vertical units are equal.`;
}
const point = (x: number, y: number, label: string, dx = 9, dy = -10) =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="3.5" class="hn-point"/><text x="${n(x + dx)}" y="${n(y + dy)}" class="hn-label">${label}</text>`;
function rightAngle(x: number, y: number, p: number, q: number): string {
  const root = Math.hypot(p, q),
    u = { x: (12 * q) / root, y: (-12 * p) / root },
    v = { x: (-12 * p) / root, y: (-12 * q) / root };
  return `<path d="M${n(x + u.x)} ${n(y + u.y)}L${n(x + u.x + v.x)} ${n(y + u.y + v.y)}L${n(x + v.x)} ${n(y + v.y)}" class="hn-right-angle"/>`;
}
export function hornOverview(s: HornState): string {
  const w = hornWitness(s),
    m = s.rise / s.run,
    hx = approximate(w.foot.x),
    hy = approximate(w.foot.y);
  const x = (v: number) => 280 + 170 * v,
    y = (v: number) => 380 - 170 * v;
  const gap = Array.from({ length: 61 }, (_, i) => {
    const v = (i / 60) * 0.95;
    return `${n(x(v))},${n(y(lower(v)))}`;
  });
  const resolved = Math.hypot(hx, hy) * 170 > 22;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 450" role="img" aria-labelledby="hn-over-title hn-over-desc"><title id="hn-over-title">The whole circle, tangent and proposed ray</title><desc id="hn-over-desc">Equal horizontal and vertical units. A is the contact, Δ is the centre, H the perpendicular foot. Κ is our added second crossing. The tan patch marks part of the curved gap outside the circle, above the tangent. ${w.relation === "cuts" ? "The ray enters the circle." : w.relation === "tangent" ? "The ray coincides with the tangent." : "The forward ray points away from the curved gap."}</desc><defs><clipPath id="hn-over-clip"><rect x="25" y="20" width="590" height="395"/></clipPath></defs><g clip-path="url(#hn-over-clip)"><path d="M280 380 L${gap.join(" L")} L${n(x(0.95))} 380Z" class="hn-gap"/><circle cx="280" cy="210" r="170" class="hn-disc"/><path d="M280 40V380M65 380H615" class="hn-axis"/><path d="M280 380L${n(x(1.9))} ${n(y(1.9 * m))}" class="hn-ray"/>${w.relation !== "tangent" ? `<path d="M280 210L${n(x(hx))} ${n(y(hy))}" class="hn-perp"/>` : ""}${w.relation === "away" ? `<path d="M280 380L${n(x(2 * hx))} ${n(y(2 * hy))}" class="hn-backward"/>` : ""}${resolved ? rightAngle(x(hx), y(hy), s.rise, s.run) + point(x(hx), y(hy), "H", -25, -6) + point(x(2 * hx), y(2 * hy), "Κ", 10, -3) : ""}${point(280, 380, "A", -20, 23)}${point(280, 210, "Δ", -24, -8)}${point(280, 40, "B", -24, -7)}<text x="590" y="401" class="hn-label">E</text></g><text x="32" y="438" class="hn-caption">${!resolved && w.relation === "cuts" ? "H and Κ merge with A at this scale. The exact crossing remains positive." : "Radius = 1. Equal horizontal and vertical scales. Κ is an added point."}</text></svg>`;
}
/** An isotropic local crop. Stable lower-arc evaluation avoids 1−sqrt(1−x²)
 * cancellation for tiny slopes; it never decides whether the point is inside.
 */
export function hornDetail(s: HornState): string {
  const w = hornWitness(s);
  const positive = w.relation === "cuts";
  const hx = positive ? approximate(w.foot.x) : 0,
    hy = positive ? approximate(w.foot.y) : 0;
  const span = hornCropWidth(s),
    scale = 540 / span;
  const cx = 320,
    cy = 185;
  const x = (v: number) => cx + (v - hx) * scale,
    y = (v: number) => cy - (v - hy) * scale;
  const left = hx - span / 2,
    right = hx + span / 2;
  const arc = Array.from({ length: 181 }, (_, i) => {
    const v = Math.max(-1, Math.min(1, left + ((right - left) * i) / 180));
    return `${n(x(v))},${n(y(lower(v)))}`;
  });
  const m = s.rise / s.run;
  const rayY = (dx: number) => cy - m * dx;
  const rayStart = positive ? Math.max(50, x(0)) : cx;
  const rayStartY = rayY(rayStart - cx);
  const root = Math.hypot(s.rise, s.run),
    tx = s.rise / root,
    ty = (s.rise * s.rise) / (root * (root + s.run));
  const centreDirection = { x: -s.rise / root, y: s.run / root };
  const label = positive ? "H" : "A";
  const bar = span / 5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 450" role="img" aria-labelledby="hn-detail-title hn-detail-desc"><title id="hn-detail-title">Equal-scale crop ${positive ? "around the perpendicular foot H" : "at the contact A"}</title><desc id="hn-detail-desc">${positive ? "The circle interior lies above its lower boundary. H lies on the ray and strictly above that boundary. The centre is in the perpendicular direction. The contact A and second crossing Κ may be outside the crop." : "The ray either coincides with the tangent or points below it, outside the proposed curved gap."} Both axes have the same scale; the crop width is ${span.toExponential(4)} radii.</desc><defs><clipPath id="hn-detail-clip"><rect x="50" y="25" width="540" height="320"/></clipPath></defs><rect x="50" y="25" width="540" height="320" class="hn-crop-bg"/><g clip-path="url(#hn-detail-clip)">${span >= 0.01 ? `<circle cx="${n(x(0))}" cy="${n(y(1))}" r="${n(scale)}" class="hn-disc"/>` : `<path d="M50 25H590 L${[...arc].reverse().join(" L")}Z" class="hn-detail-interior"/><path d="M${arc.join(" L")}" class="hn-boundary"/>`}<path d="M${n(rayStart)} ${n(rayStartY)}L590 ${n(rayY(270))}" class="hn-ray"/>${rayStart > 50 ? `<path d="M50 ${n(rayY(-270))}L${n(rayStart)} ${n(rayStartY)}" class="hn-backward"/>` : ""}${positive ? `<path d="M${n(cx + centreDirection.x * 600)} ${n(cy - centreDirection.y * 600)}L${n(cx - centreDirection.x * 600)} ${n(cy + centreDirection.y * 600)}" class="hn-perp"/>${point(x(tx), y(ty), "Θ", 12, 22)}${rightAngle(cx, cy, s.rise, s.run)}` : ""}${point(cx, cy, label, -24, -12)}</g><rect x="50" y="25" width="540" height="320" class="hn-crop-frame"/><text x="65" y="53" class="hn-caption">${positive ? "Circle interior" : "Circle interior"}</text><path d="M50 375H158M50 370V380M158 370V380" class="hn-axis"/><text x="50" y="404" class="hn-caption">Bar = ${bar.toExponential(4)} radii</text><text x="50" y="433" class="hn-caption">Equal horizontal and vertical scales · crop width ${span.toExponential(4)} radii</text></svg>`;
}
export function hornCertificate(s: HornState): string {
  const w = hornWitness(s);
  const row = (label: string, value: string) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  return `<dl class="hn-exact">${row("Ray slope: rise / run", exact(w.slope))}${row("H: perpendicular foot (x, y)", `(${exact(w.foot.x)}, ${exact(w.foot.y)})`)}${row("ΔH²", exact(w.centreDistanceSquared))}${row("1 − ΔH²", exact(w.radiusSquaredMinusDistanceSquared))}${s.focus === "crossing" ? row("Κ: second crossing (x, y)", `(${exact(w.second.x)}, ${exact(w.second.y)})`) + row("Positive-ray crossing parameter t", exact(w.secondParameter)) : row("Foot parameter t on (run × t, rise × t)", exact(w.footParameter))}</dl>`;
}
export function hornProof(s: HornState): string {
  return s.focus === "foot"
    ? `<h3>A point on the line is inside the circle</h3><p>Put A at (0, 0), Δ at (0, 1), and write the ray as (qt, pt) for t ≥ 0, with rise p and run q. Its perpendicular foot is H = (pq/(p² + q²), p²/(p² + q²)).</p><p><strong>ΔH² = q²/(p² + q²).</strong> If p &gt; 0, H lies forward on the ray and ΔH² &lt; 1. A point on the ray is inside the circle, so the ray cannot stay in the outside gap. The exact deficit p²/(p² + q²) remains positive however small a positive p/q is.</p>`
    : `<h3>Find the other crossing without guessing a pixel</h3><p>Substitute the ray (qt, pt) into the unit circle x² + (y − 1)² = 1. The difference between squared distance and squared radius is <strong>t((p² + q²)t − 2p)</strong>.</p><p>Besides t = 0 at A, the other root is <strong>t = 2p/(p² + q²)</strong>. For p &gt; 0 this is positive. Halfway to it lies H, strictly inside. For p = 0 both roots coincide at A; for p &lt; 0 the other root is on the backward extension. These are different geometric cases.</p>`;
}
