import { useEffect, useRef } from "react";
const COLORS = ["#FBCFE8", "#BFDBFE", "#FDE68A", "#A7F3D0", "#DDD6FE", "#FED7AA", "#A5F3FC", "#FECACA"];

export default function Wheel({ choices, dark, spinning, onSpin, wheelRef }) {
  const cv = useRef(null);
  useEffect(() => {
    const el = cv.current, ctx = el.getContext("2d"), S = el.width, c = S / 2, r = c - 6, n = choices.length;
    ctx.clearRect(0, 0, S, S);
    if (n < 2) {
      ctx.fillStyle = dark ? "#2A2F3D" : "#EEF0F6"; ctx.beginPath(); ctx.arc(c, c, r, 0, 7); ctx.fill();
      ctx.fillStyle = dark ? "#A3AAB8" : "#4B5563"; ctx.font = "600 34px Inter,sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Add 2+ choices", c, c + r * 0.45); return;
    }
    const seg = (2 * Math.PI) / n;
    choices.forEach((t0, i) => {
      const a0 = -Math.PI / 2 + i * seg;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, r, a0, a0 + seg); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]; if (n % COLORS.length === 1 && i === n - 1) ctx.fillStyle = COLORS[3];
      ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.translate(c, c); ctx.rotate(a0 + seg / 2);
      ctx.font = `600 ${Math.max(18, Math.min(40, r * seg * 0.42))}px Inter,sans-serif`;
      ctx.fillStyle = "#111827"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      let t = t0; while (ctx.measureText(t).width > r * 0.56 && t.length > 1) t = t.slice(0, -1);
      if (t !== t0) t = t.trimEnd() + "…";
      ctx.fillText(t, r - 30, 0);
      ctx.beginPath(); ctx.arc(r - 12, 0, 4, 0, 7); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
      ctx.restore();
    });
  }, [choices, dark]);

  return (
    <div className="wheel-box">
      <div className="pointer" aria-hidden="true" />
      <div className="ring">
        <canvas ref={(n) => { cv.current = n; wheelRef.current = n; }} width="800" height="800" role="img" aria-label="Wheel of choices" />
      </div>
      <button className="spin" onClick={onSpin} disabled={spinning || choices.length < 2}
        aria-label={choices.length < 2 ? "Spin (add at least two choices first)" : "Spin the wheel"}>SPIN</button>
    </div>
  );
}
