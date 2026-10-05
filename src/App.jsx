import { useEffect, useRef, useState } from "react";
import Wheel from "./Wheel.jsx";
import { MAX, MAXLEN, validate, randInt, rand01, encode, decodeHash } from "./lib.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (t) => 1 - Math.pow(1 - t, 4);
const CONF = ["#6366F1", "#8B5CF6", "#EC4899", "#22D3EE", "#FBBF24"];

function initial() {
  const d = decodeHash(location.hash);
  if (Array.isArray(d)) return { list: d, msg: "" };
  return { list: ["Pizza", "Burger", "Biryani", "Dosa", "Pasta"], msg: d ? "That shared link looks damaged, so we loaded the default choices instead." : "" };
}

export default function App() {
  const init = useRef(initial()).current;
  const [choices, setChoices] = useState(init.list);
  const [msg, setMsg] = useState(init.msg);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(-1);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("spinly-theme") || "light"; } catch { return "light"; } });
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState("");
  const wheelRef = useRef(null), rot = useRef(0), input = useRef(null), dlg = useRef(null), urlRef = useRef(null);
  const dark = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("spinly-theme", theme); } catch {}
  }, [theme]);
  useEffect(() => {
    try { history.replaceState(null, "", choices.length ? "#c=" + encode(choices) : location.pathname + location.search); } catch {}
  }, [choices]);
  useEffect(() => {
    const d = dlg.current; if (!d) return;
    if (shareOpen && !d.open) { d.showModal(); urlRef.current?.select(); }
    if (!shareOpen && d.open) d.close();
  }, [shareOpen]);

  const update = (list) => { setChoices(list); setWinner(null); };

  function spin() {
    if (spinning || choices.length < 2) return;
    setSpinning(true); setWinner(null);
    const n = choices.length, seg = 360 / n, idx = randInt(n);
    const jitter = (rand01() - 0.5) * seg * 0.7; // keep clear of segment edges
    const target = -((idx + 0.5) * seg + jitter); // puts segment idx under the top pointer
    const delta = (((target - rot.current) % 360) + 360) % 360;
    const total = delta + (reduced ? 0 : 360 * (5 + randInt(3)));
    const dur = reduced ? 400 : 3800 + rand01() * 600, start = rot.current, t0 = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      wheelRef.current.style.transform = `rotate(${start + total * ease(p)}deg)`;
      if (p < 1) return requestAnimationFrame(frame);
      rot.current = (((start + total) % 360) + 360) % 360;
      wheelRef.current.style.transform = `rotate(${rot.current}deg)`;
      setSpinning(false); setWinner(choices[idx]);
      if (!reduced) {
        const id = Date.now();
        setConfetti(Array.from({ length: 28 }, (_, i) => ({ k: id + i, x: rand01() * 100, d: rand01() * 0.3, c: CONF[i % 5] })));
        setTimeout(() => setConfetti([]), 2200);
      }
    };
    requestAnimationFrame(frame);
  }

  function add(e) {
    e.preventDefault();
    if (choices.length >= MAX) return setMsg(`Spinly supports up to ${MAX} choices — beyond that the wheel gets too crowded to read.`);
    const r = validate(draft, choices); if (r.err) return setMsg(r.err);
    update([...choices, r.v]); setDraft(""); setMsg("");
  }
  function save(i, val) {
    const r = validate(val, choices, i); if (r.err) return setMsg(r.err);
    update(choices.map((c, j) => (j === i ? r.v : c))); setEditing(-1); setMsg("");
  }
  const shareUrl = () => location.href.split("#")[0] + "#c=" + encode(choices);
  async function copy() {
    const u = urlRef.current.value; let ok = false;
    try { await navigator.clipboard.writeText(u); ok = true; } catch { try { urlRef.current.select(); ok = document.execCommand("copy"); } catch {} }
    setToast(ok ? "Link copied!" : "Couldn’t copy automatically — select the link and copy it.");
  }

  return (
    <div className="wrap">
      <header>
        <div className="brand"><span className="logo" aria-hidden="true">✦</span>Spinly</div>
        <button className="icon-btn" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>{dark ? "☀️" : "🌙"}</button>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">Random picker</span>
          <h1>Can’t <em>decide?</em></h1>
          <h2>Let randomness decide.</h2>
          <p>Add your choices, spin the wheel, and let randomness pick one for you.</p>
        </section>

        <section className="wheel-col" aria-label="Wheel">
          <Wheel choices={choices} dark={dark} spinning={spinning} onSpin={spin} wheelRef={wheelRef} />
        </section>

        <section className="card choices" aria-labelledby="ch">
          <div className="card-head"><h3 id="ch">Your choices</h3><span className="pill">{choices.length}/{MAX}</span></div>
          <fieldset disabled={spinning} className="fs">
            <form className="add" onSubmit={add} autoComplete="off">
              <label className="sr" htmlFor="nc">New choice</label>
              <input id="nc" ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAXLEN} placeholder="Add a choice…" />
              <button className="btn solid" type="submit">Add</button>
            </form>
            <div className="msg" role="status">{msg}</div>
            <ul className="list">
              {choices.map((c, i) => (
                <li className="row" key={c + i}>
                  <span className="dot" style={{ background: ["#F9A8D4", "#93C5FD", "#FCD34D", "#6EE7B7", "#C4B5FD", "#FDBA74", "#67E8F9", "#FCA5A5"][i % 8] }} />
                  {editing === i ? <EditRow value={c} onSave={(v) => save(i, v)} onCancel={() => { setEditing(-1); setMsg(""); }} /> : (
                    <>
                      <span className="t">{c}</span>
                      <button className="b" aria-label={`Edit ${c}`} onClick={() => { setEditing(i); setMsg(""); }}>✎</button>
                      <button className="b" aria-label={`Remove ${c}`} onClick={() => update(choices.filter((_, j) => j !== i))}>🗑</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {!choices.length && (
              <div className="empty"><b>No choices yet</b>Add at least 2 options to spin the wheel.
                <button className="btn solid" type="button" onClick={() => input.current.focus()}>Add your first choice</button></div>
            )}
          </fieldset>
        </section>

        <section className="card result" aria-labelledby="rs">
          {confetti.map((p) => <i key={p.k} className="conf" style={{ left: p.x + "%", background: p.c, animationDelay: p.d + "s" }} />)}
          <div className="label" id="rs">Result</div>
          <div className={"winner" + (winner ? " pop" : "")} key={winner || "none"} aria-live="polite">{spinning ? "…" : winner || "—"}</div>
          <p className="hint">{spinning ? "Spinning…" : winner ? "Your random pick!" : "Press SPIN to get your random pick."}</p>
          <div className="actions">
            {winner && <button className="btn solid wide" onClick={spin} autoFocus>↻ Pick Again</button>}
            {winner && <button className="btn soft" onClick={() => { setWinner(null); input.current.focus(); input.current.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); }}>✎ Edit Choices</button>}
            <button className="btn soft" disabled={!choices.length} onClick={() => { setToast(""); setShareOpen(true); }}>↗ Share</button>
          </div>
        </section>
      </main>

      <dialog ref={dlg} onClose={() => setShareOpen(false)} onClick={(e) => e.target === dlg.current && setShareOpen(false)} aria-labelledby="dt">
        <h3 id="dt">Share this picker</h3>
        <p>Anyone with this link gets the same choices. Nothing is stored on a server.</p>
        <div className="copyrow"><input ref={urlRef} readOnly value={shareOpen ? shareUrl() : ""} aria-label="Shareable link" /><button className="btn solid" onClick={copy}>Copy</button></div>
        <div className="dlg-foot"><span className="toast" role="status">{toast}</span>
          <span>{navigator.share && <button className="btn soft" onClick={() => navigator.share({ title: "Spinly", text: "Spin my picker!", url: shareUrl() }).catch(() => {})}>Share…</button>} <button className="btn soft" onClick={() => setShareOpen(false)}>Close</button></span></div>
      </dialog>
    </div>
  );
}

function EditRow({ value, onSave, onCancel }) {
  const [v, setV] = useState(value);
  return (
    <>
      <input autoFocus value={v} maxLength={MAXLEN} aria-label="Edit choice" onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSave(v); } if (e.key === "Escape") onCancel(); }} />
      <button className="b" type="button" aria-label="Save choice" onClick={() => onSave(v)}>✓</button>
      <button className="b" type="button" aria-label="Cancel edit" onClick={onCancel}>✕</button>
    </>
  );
}
