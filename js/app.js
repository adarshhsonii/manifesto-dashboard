/**
 * MP Manifesto Watch · मध्य प्रदेश संकल्प-पत्र ट्रैकर
 * Application Logic & Interactive Dashboard Controller
 *
 * Modules:
 * - Constants, State & Filtering Logic
 * - DOM Helpers & Counter Animation
 * - KPI Cards & Metric Renderers
 * - Chart.js Visualizations (Donut, Stacked Category, Department Load, Evidence)
 * - Category x Status Heatmap
 * - Dynamic Rule-Based Data Insights
 * - Paginated Promise Explorer Table
 * - Interactive Slide-Out Detail Drawer
 * - Spotlight Carousel with Auto-Rotate
 * - Theme Switcher (Orange, Light, Dark)
 * - Interactive Micro-Animations (Confetti, 3D Card Tilt, Ripple, Scroll Progress)
 */

const ST = ["पूर्ण", "प्रगति पर", "प्रारंभिक चरण", "प्रारंभ नहीं"],
  EN = ["Fulfilled", "In progress", "Early stage", "Not started"],
  IC = ["✔", "▶", "◐", "○"];
const CV = ["--s0", "--s1", "--s2", "--s3"];
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const css = (v) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const nf = (n) => Math.round(n).toLocaleString("en-IN");
const cats = [...new Set(DATA.map((d) => d.c))].sort(
  (a, b) =>
    DATA.filter((x) => x.c == b).length - DATA.filter((x) => x.c == a).length,
);
const F = { st: null, c: "", q: "", im: "", d: "" };
let page = 0;
const PS = 12;
const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
const pass = (d, skip) =>
  (skip == "st" || !F.st || d.st == F.st) &&
  (skip == "c"  || !F.c  || d.c  == F.c) &&
  (!F.d  || d.d  == F.d) &&
  (!F.im || d.im == F.im) &&
  (!F.q ||
    (d.t + d.s + d.dall + d.n + (d.nt || "") + (d.ant || "") + (d.rsn || ""))
      .toLowerCase()
      .includes(F.q));
const by = (arr, k) =>
  arr.reduce((m, d) => ((m[d[k]] = (m[d[k]] || []).concat(d)), m), {});
const cnt = (a) => ST.map((s) => a.filter((d) => d.st == s).length);
function anim(el, to, fmt = nf, ms = 1100) {
  const from = +el.dataset.v || 0;
  el.dataset.v = to;
  if (RM) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  // Spring easing: overshoots slightly then settles
  const ease = p => {
    const c4 = (2 * Math.PI) / 3;
    if (p === 0) return 0;
    if (p === 1) return 1;
    return Math.pow(2, -9 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
  };
  (function f(t) {
    const p = Math.min(1, (t - t0) / ms);
    el.textContent = fmt(from + (to - from) * ease(p));
    if (p < 1) requestAnimationFrame(f);
    else el.textContent = fmt(to);
  })(t0);
}
$("cs").innerHTML =
  '<option value="">श्रेणी: सभी / All categories</option>' +
  cats.map((c) => `<option>${esc(c)}</option>`).join("");
// Populate department dropdown sorted by promise count
const depts = [...new Set(DATA.map((d) => d.d))].sort(
  (a, b) => DATA.filter((x) => x.d == b).length - DATA.filter((x) => x.d == a).length
);
$("ds").innerHTML =
  '<option value="">विभाग: सभी / All departments</option>' +
  depts.map((d) => `<option value="${esc(d)}">${esc(d)} (${DATA.filter((x) => x.d == d).length})</option>`).join("");
let charts = {};
function mk(id, cfg) {
  charts[id] = new Chart($(id), cfg);
  return charts[id];
}
Chart.defaults.font.family = "Inter,'Noto Sans Devanagari',sans-serif";
function render() {
  const tc = css("--mu"),
    gc = css("--bd");
  Chart.defaults.color = tc;
  const L = DATA.filter((d) => pass(d)),
    N = L.length,
    C = cnt(L);
  // KPIs
  const kp = $("kp");
  if (!kp.children.length)
    kp.innerHTML =
      `<button class="card k rv" data-s="" style="--c:var(--pr)"><div class="l"><span>Total promises</span><span>Σ</span></div><div class="v" id="k_t">0</div><div class="p" id="p_t"></div><div class="bar"><i></i></div></button>` +
      ST.map(
        (s, i) =>
          `<button class="card k rv" style="--i:${i + 1};--c:var(${CV[i]})" data-s="${s}"><div class="l"><span>${IC[i]} ${EN[i]}</span><span>${s}</span></div><div class="v" id="k_${i}">0</div><div class="p" id="p_${i}"></div><div class="bar"><i></i></div></button>`,
      ).join("");
  anim($("k_t"), N);
  $("p_t").textContent = `of ${nf(DATA.length)} in workbook`;
  kp.children[0].querySelector("i").style.width = (N / DATA.length) * 100 + "%";
  ST.forEach((s, i) => {
    anim($("k_" + i), C[i]);
    $("p_" + i).textContent =
      (N ? (C[i] / N) * 100 : 0).toFixed(1) + "% of selection";
    kp.children[i + 1].querySelector("i").style.width =
      (N ? (C[i] / N) * 100 : 0) + "%";
    kp.children[i + 1].classList.toggle("on", F.st == s);
  });
  const fr = N ? (C[0] / N) * 100 : 0;
  $("rg").style.strokeDashoffset = 502.65 * (1 - fr / 100);
  anim($("rv"), fr, (v) => v.toFixed(1) + "%");
  $("rs").textContent = `${C[0]} पूर्ण / ${N} वादे`;
  $("rc").innerHTML = `<b>${N}</b> results`;
  $("dt").textContent = N;
  // donut
  const dd = {
    labels: EN,
    datasets: [
      {
        data: C,
        backgroundColor: CV.map(css),
        borderWidth: 3,
        borderColor: css("--sf"),
        hoverOffset: 10,
      },
    ],
  };
  if (charts.c1) {
    charts.c1.data = dd;
    charts.c1.update();
  } else
    mk("c1", {
      type: "doughnut",
      data: dd,
      options: {
        cutout: "68%",
        maintainAspectRatio: false,
        onClick: (e, a) => {
          if (a[0]) setSt(ST[a[0].index]);
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8 },
          },
        },
        animation: { duration: RM ? 0 : 1100 },
      },
    });
  // category stacked
  const base = DATA.filter((d) => pass(d, "c")),
    g = by(base, "c"),
    cl = cats.filter((c) => g[c]);
  const ds = ST.map((s, i) => ({
    label: EN[i],
    data: cl.map((c) => g[c].filter((d) => d.st == s).length),
    backgroundColor: css(CV[i]),
    borderRadius: 3,
  }));
  const d2 = {
    labels: cl.map((c) => (c.length > 26 ? c.slice(0, 25) + "…" : c)),
    datasets: ds,
  };
  if (charts.c2) {
    charts.c2.data = d2;
    charts.c2._cl = cl;
    charts.c2.update();
  } else {
    mk("c2", {
      type: "bar",
      data: d2,
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        onClick: (e, a) => {
          if (a[0]) {
            const c = charts.c2._cl[a[0].index];
            setCat(F.c == c ? "" : c);
          }
        },
        scales: {
          x: { stacked: true, grid: { color: gc } },
          y: { stacked: true, grid: { display: false } },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8 },
          },
        },
        animation: { duration: RM ? 0 : 900 },
      },
    });
    charts.c2._cl = cl;
  }
  // dept
  const gd = by(L, "d"),
    dl = Object.keys(gd)
      .sort((a, b) => gd[b].length - gd[a].length)
      .slice(0, 10);
  const d3 = {
    labels: dl.map((x) => x.replace(" विभाग", "")),
    datasets: ST.map((s, i) => ({
      label: EN[i],
      data: dl.map((x) => gd[x].filter((d) => d.st == s).length),
      backgroundColor: css(CV[i]),
      borderRadius: 3,
    })),
  };
  if (charts.c3) {
    charts.c3.data = d3;
    charts.c3.update();
  } else
    mk("c3", {
      type: "bar",
      data: d3,
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: gc } },
          y: { stacked: true, grid: { display: false } },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8 },
          },
        },
        animation: { duration: RM ? 0 : 900 },
      },
    });
  // evidence
  const wl = L.filter((d) => d.u.length).length;
  $("ev").innerHTML =
    `<div style="display:flex;justify-content:space-between;font-size:13px"><span><b style="font-size:26px">${N ? ((wl / N) * 100).toFixed(1) : 0}%</b> have ≥1 source</span><span style="color:var(--mu)">${wl} / ${N} · avg ${(N ? L.reduce((a, d) => a + d.u.length, 0) / N : 0).toFixed(1)} links</span></div><div class="k" style="cursor:default"><div class="bar" style="height:8px"><i style="width:${N ? (wl / N) * 100 : 0}%;background:var(--ac)"></i></div></div>`;
  const av = ST.map((s) => {
    const a = L.filter((d) => d.st == s);
    return a.length ? a.reduce((x, d) => x + d.u.length, 0) / a.length : 0;
  });
  const d4 = {
    labels: EN,
    datasets: [
      {
        label: "Avg links / promise",
        data: av.map((v) => +v.toFixed(2)),
        backgroundColor: CV.map(css),
        borderRadius: 8,
      },
    ],
  };
  if (charts.c4) {
    charts.c4.data = d4;
    charts.c4.update();
  } else
    mk("c4", {
      type: "bar",
      data: d4,
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            grid: { color: gc },
            title: { display: true, text: "avg links / promise" },
          },
          x: { grid: { display: false } },
        },
        plugins: { legend: { display: false } },
        animation: { duration: RM ? 0 : 900 },
      },
    });
  // heatmap
  const gb = by(base, "c");
  let h =
    '<div class="h">Category</div>' +
    EN.map((e) => `<div class="h">${e}</div>`).join("");
  let k = 0;
  cl.forEach((c) => {
    const a = gb[c],
      cc = cnt(a);
    h +=
      `<div class="r" data-c="${esc(c)}">${esc(c)} <span style="color:var(--mu)">(${a.length})</span></div>` +
      cc
        .map((v, i) => {
          const p = v / a.length;
          return `<div class="ce" style="animation-delay:${RM ? 0 : k++ * 18}ms;background:color-mix(in srgb,var(${CV[i]}) ${Math.round(p * 85 + 4)}%,transparent);color:${p > 0.45 ? "#fff" : "var(--tx)"}">${v}<br><small>${Math.round(p * 100)}%</small></div>`;
        })
        .join("");
  });
  $("hm").innerHTML = h;
  // insights
  const I = [],
    pl = (a) =>
      a.filter((d) => d.st == "प्रारंभिक चरण" || d.st == "प्रारंभ नहीं").length;
  const gc2 = by(L, "c"),
    cs2 = Object.keys(gc2).filter((c) => gc2[c].length >= 10);
  if (cs2.length) {
    const a = cs2
      .map((c) => [
        c,
        gc2[c].filter((d) => d.st == "पूर्ण").length / gc2[c].length,
        gc2[c].length,
      ])
      .sort((x, y) => y[1] - x[1])[0];
    I.push([
      "Highest fulfilment share",
      `${a[0]}: ${(a[1] * 100).toFixed(1)}% पूर्ण`,
      `${Math.round(a[1] * a[2])} of ${a[2]} promises · categories with n≥10`,
    ]);
    const b = cs2
      .map((c) => [
        c,
        gc2[c].filter((d) => d.st == "प्रारंभ नहीं").length / gc2[c].length,
        gc2[c].length,
      ])
      .sort((x, y) => y[1] - x[1])[0];
    I.push([
      "Highest not-started share",
      `${b[0]}: ${(b[1] * 100).toFixed(1)}% प्रारंभ नहीं`,
      `${Math.round(b[1] * b[2])} of ${b[2]} promises · n≥10`,
    ]);
  }
  const dk = Object.keys(gd)
    .filter((x) => gd[x].length >= 5)
    .sort((a, b) => pl(gd[b]) - pl(gd[a]))[0];
  if (dk)
    I.push([
      "Most pending-like by department",
      `${dk}: ${pl(gd[dk])} वादे`,
      `pending-like = प्रारंभिक चरण + प्रारंभ नहीं · of ${gd[dk].length} in dept`,
    ]);
  const hn = L.filter((d) => d.im == "उच्च" && d.st == "प्रारंभ नहीं").length;
  I.push([
    "High-priority, not started",
    `${hn} “उच्च” महत्व वाले वादे प्रारंभ नहीं`,
    `of ${L.filter((d) => d.im == "उच्च").length} high-importance promises in selection`,
  ]);
  const ns = N - wl;
  I.push([
    "Evidence gap",
    `${ns} वादों में कोई संदर्भ-लिंक नहीं`,
    `${N ? ((ns / N) * 100).toFixed(1) : 0}% of ${N} · “no link” ≠ not delivered`,
  ]);
  $("ins").innerHTML = I.map(
    (x, i) =>
      `<div class="card"><div class="t">Data insight</div><p>${esc(x[1])}</p><small>${esc(x[0])} · ${esc(x[2])}</small></div>`,
  ).join("");
  table(L);
  $("fb")
    .querySelectorAll(".stc")
    .forEach((e) => e.remove());
}
function table(L) {
  const T = Math.max(1, Math.ceil(L.length / PS));
  if (page >= T) page = T - 1;
  const r = L.slice(page * PS, page * PS + PS);
  $("tb").innerHTML = r.length
    ? r
        .map((d) => {
          const i = ST.indexOf(d.st);
          return `<tr tabindex="0" data-n="${d.n}"><td>${d.n}</td><td><b>${esc(d.t)}</b></td><td class="hide-s">${esc(d.d.replace(" विभाग", ""))}</td><td class="hide-s">${esc(d.c)}</td><td><span class="bd" style="--c:var(${CV[i]})">${IC[i]} ${esc(d.st)}</span></td><td>${d.u.length || "—"}</td></tr>`;
        })
        .join("")
    : '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--mu)">कोई परिणाम नहीं — फ़िल्टर साफ़ करके देखें।</td></tr>';
  $("pi").textContent = L.length
    ? `${page * PS + 1}–${Math.min(L.length, page * PS + PS)} of ${L.length}`
    : "0 results";
  $("pp").disabled = page == 0;
  $("pn").disabled = page >= T - 1;
}
function setSt(s) {
  F.st = F.st == s || !s ? null : s;
  page = 0;
  render();
}
function setCat(c) {
  F.c = c;
  $("cs").value = c;
  page = 0;
  render();
}
function open_(n) {
  const d = DATA.find((x) => x.n == n),
    i = ST.indexOf(d.st);
  let html = `<button class="x" id="dx" aria-label="Close">✕</button>
<span class="bd" style="--c:var(${CV[i]})">${IC[i]} ${esc(d.st)}</span>
<h3>#${d.n} · ${esc(d.t)}</h3>
<div style="color:var(--mu);font-size:13px">${esc(d.dall || d.d)} · ${esc(d.c)}</div>

<h4>विवरण</h4>
<div>${esc(d.s) || "—"}</div>

<h4>कार्य प्रारंभ · राजनीतिक महत्व</h4>
<div>${esc(d.sp)} · ${esc(d.im)}</div>

<h4>टिप्पणी / अद्यतन</h4>
<div>${esc(d.nt) || '<i style="color:var(--mu)">Evidence not yet added / कोई टिप्पणी नहीं</i>'}</div>`;

  if (d.rsn) {
    html += `<h4>कार्य लंबित होने के कारण</h4>
<div class="wn" style="margin-top:6px">${esc(d.rsn)}</div>`;
  }

  if (d.ant) {
    html += `<h4>अतिरिक्त टिप्पणी / अद्यतन</h4>
<div style="background:color-mix(in srgb,var(--pr) 8%,transparent);border-radius:10px;padding:10px 12px;margin-top:6px;font-size:13.5px;line-height:1.55">${esc(d.ant)}</div>`;
  }

  html += `<h4>स्रोत / Sources (${d.u.length})</h4>`;
  if (d.u.length) {
    html +=
      "<ul>" +
      d.u
        .map(
          (u) =>
            `<li><small style="color:var(--mu);font-weight:600">${esc(u[0])}</small><br><a href="${esc(u[1])}" target="_blank" rel="noopener noreferrer">${esc(u[1].slice(0, 90))} ↗</a></li>`,
        )
        .join("") +
      "</ul>";
  } else {
    html += `<i style="color:var(--mu)">Evidence not yet added — यह “वादा अधूरा” का प्रमाण नहीं है।</i>`;
  }

  $("dr").innerHTML = html;
  $("dr").classList.add("on");
  $("ovl").classList.add("on");
  $("dr").setAttribute("aria-hidden", "false");
  $("dx").focus();
  $("dx").onclick = close_;
}
function close_() {
  $("dr").classList.remove("on");
  $("ovl").classList.remove("on");
  $("dr").setAttribute("aria-hidden", "true");
}
$("ovl").onclick = close_;
addEventListener("keydown", (e) => {
  if (e.key == "Escape") close_();
  if (e.key == "Enter" && e.target.matches("tr[data-n]"))
    open_(e.target.dataset.n);
});
$("tb").onclick = (e) => {
  const t = e.target.closest("tr[data-n]");
  if (t) {
    if (!RM) {
      t.classList.remove("row-clicked");
      void t.offsetWidth;
      t.classList.add("row-clicked");
      setTimeout(() => t.classList.remove("row-clicked"), 500);
    }
    open_(t.dataset.n);
  }
};
$("kp").onclick = (e) => {
  const k = e.target.closest(".k");
  if (k) setSt(k.dataset.s);
};
$("hm").onclick = (e) => {
  const r = e.target.closest(".r");
  if (r) {
    if (!RM) {
      r.classList.remove("hm-clicked");
      void r.offsetWidth;
      r.classList.add("hm-clicked");
      setTimeout(() => r.classList.remove("hm-clicked"), 450);
    }
    setCat(F.c == r.dataset.c ? "" : r.dataset.c);
  }
};
$("cs").onchange = (e) => setCat(e.target.value);
$("ds").onchange = (e) => {
  F.d = e.target.value;
  page = 0;
  render();
};
$("is").onchange = (e) => {
  F.im = e.target.value;
  page = 0;
  render();
};
let tm;
$("q").oninput = (e) => {
  clearTimeout(tm);
  tm = setTimeout(() => {
    F.q = e.target.value.trim().toLowerCase();
    page = 0;
    render();
  }, 180);
};
$("clr").onclick = () => {
  F.st = null;
  F.c = "";
  F.q = "";
  F.im = "";
  F.d = "";
  $("q").value = "";
  $("cs").value = "";
  $("ds").value = "";
  $("is").value = "";
  page = 0;
  render();
};
$("pp").onclick = () => {
  page--;
  render();
  $("ex").scrollIntoView();
};
$("pn").onclick = () => {
  page++;
  render();
  $("ex").scrollIntoView();
};
const TH = ["light", "dark", "orange"],
  TL = { light: "☀ Light", dark: "☾ Dark", orange: "🟠 Orange" };
$("th").textContent = "◐ Theme";
$("th").onclick = () => {
  const r = document.documentElement,
    cur =
      r.dataset.theme ||
      (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"),
    nx = TH[(TH.indexOf(cur) + 1) % 3];
  // Flash blur transition + spin animation
  if (!RM) {
    document.documentElement.classList.add("theme-switching");
    setTimeout(() => document.documentElement.classList.remove("theme-switching"), 350);
    $("th").classList.remove("th-spin");
    void $("th").offsetWidth;
    $("th").classList.add("th-spin");
    setTimeout(() => $("th").classList.remove("th-spin"), 600);
  }
  r.dataset.theme = nx;
  $("th").textContent = TL[nx];
  Object.values(charts).forEach((c) => c.destroy());
  charts = {};
  render();
}
if ($("hn")) $("hn").textContent = DATA.length;
document.documentElement.dataset.theme = "orange";
$("th").textContent = TL.orange;
{
  const SPL = DATA.filter((d) => d.st == "पूर्ण");
  let si = 0,
    stm;
  const sc = $("spl");
  const spShow = (k) => {
    si = (k + SPL.length) % SPL.length;
    const d = SPL[si],
      b = $("spb"),
      n = $("spn"),
      t = sc.querySelector(".spt");
    n.textContent = "#" + d.n;
    b.innerHTML = `<span class="eb2">✔ Fulfilled · ${si + 1} / ${SPL.length}</span><h3>${esc(d.t)}</h3><p>${esc(d.nt || d.s)}</p><small>${esc(d.d)} · ${esc(d.c)}</small>`;
    [b, n].forEach((e) => {
      e.classList.remove("swp");
      void e.offsetWidth;
      e.classList.add("swp");
    });
    t.style.animation = "none";
    void t.offsetWidth;
    t.style.animation = "";
    clearTimeout(stm);
    if (!RM && !sc.matches(":hover"))
      stm = setTimeout(() => spShow(si + 1), 6000);
  };
  $("sp_n").onclick = () => {
    if (!RM) {
      $("sp_n").classList.remove("arrow-clicked");
      void $("sp_n").offsetWidth;
      $("sp_n").classList.add("arrow-clicked");
      setTimeout(() => $("sp_n").classList.remove("arrow-clicked"), 400);
    }
    spShow(si + 1);
  };
  $("sp_p").onclick = () => {
    if (!RM) {
      $("sp_p").classList.remove("arrow-clicked");
      void $("sp_p").offsetWidth;
      $("sp_p").classList.add("arrow-clicked");
      setTimeout(() => $("sp_p").classList.remove("arrow-clicked"), 400);
    }
    spShow(si - 1);
  };
  sc.onmouseenter = () => clearTimeout(stm);
  sc.onmouseleave = () => {
    if (!RM) {
      clearTimeout(stm);
      stm = setTimeout(() => spShow(si + 1), 6000);
    }
  };
  spShow(0);
  const io2 = new IntersectionObserver(
    (es) =>
      es.forEach((x) => {
        if (x.isIntersecting) {
          x.target.classList.add("in");
          io2.unobserve(x.target);
        }
      }),
    { threshold: 0.1 },
  );
  document.querySelectorAll(".sec,.sp").forEach((e) => {
    e.classList.add("rv");
    io2.observe(e);
  });
  const hr = document.querySelector(".hero");
  hr.addEventListener("pointermove", (e) => {
    const r = hr.getBoundingClientRect();
    hr.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(2));
    hr.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(2));
    // Magnetic parallax for hero orbs
    const ox = ((e.clientX - r.left) / r.width - 0.5) * 28;
    const oy = ((e.clientY - r.top) / r.height - 0.5) * 18;
    hr.querySelectorAll(".hero-orb").forEach((orb, i) => {
      const factor = (i + 1) * 0.5;
      orb.style.transform = `translate(${ox * factor}px, ${oy * factor}px)`;
    });
  });
  hr.addEventListener("pointerleave", () => {
    hr.querySelectorAll(".hero-orb").forEach(orb => {
      orb.style.transform = '';
    });
  });
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest && e.target.closest(".btn,.chip,.pg button");
    if (!b || RM) return;
    const r = b.getBoundingClientRect(),
      s = Math.max(r.width, r.height) * 2,
      p = document.createElement("span");
    p.className = "rp";
    p.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(p);
    setTimeout(() => p.remove(), 700);
  });
  // Global Click Shockwave + Sparkle Burst on Interactive Elements
  const spawnClickFx = (x, y, color) => {
    if (RM) return;
    const ring = document.createElement("div");
    ring.className = "click-fx-ring";
    ring.style.left = x + "px";
    ring.style.top = y + "px";
    if (color) ring.style.setProperty("--fx-c", color);
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 600);

    const palette = color
      ? [color, "#ffffff", color]
      : ["#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6", "#ffffff"];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "click-fx-particle";
      const angle = (i / 6) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = 22 + Math.random() * 26;
      const size = 3 + Math.random() * 4;
      p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${palette[i % palette.length]};box-shadow:0 0 6px ${palette[i % palette.length]};--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 650);
    }
  };
  document.addEventListener("click", (e) => {
    if (RM) return;
    const clickable = e.target.closest && e.target.closest("button, a, .chip, .k, .btn, tr[data-n], .r, select, input, #th, #bt, .sp_p, .sp_n");
    if (!clickable) return;
    let col = null;
    if (clickable.dataset && clickable.dataset.s) {
      const sc = { "पूर्ण": "#10b981", "प्रगति पर": "#f59e0b", "प्रारंभिक चरण": "#0ea5e9", "प्रारंभ नहीं": "#ef4444" };
      col = sc[clickable.dataset.s];
    }
    spawnClickFx(e.clientX, e.clientY, col);
  });
  const conf = (x, y) => {
    if (RM) return;
    const cl = ["#fde047", "#f97316", "#dc2626", "#16a34a", "#fff", "#fb923c", "#8b5cf6", "#2dd4bf"];
    for (let i = 0; i < 64; i++) {
      const p = document.createElement("i");
      p.className = "cf";
      const a = Math.random() * Math.PI * 2,
        v = 80 + Math.random() * 220;
      const isCircle = i % 3 === 0;
      const size = isCircle ? (4 + Math.random() * 7) : (6 + Math.random() * 10);
      const borderR = isCircle ? '50%' : Math.round(Math.random() * 3) + 'px';
      p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${cl[i % cl.length]};border-radius:${borderR};--dx:${Math.cos(a) * v}px;--dy:${Math.sin(a) * v + 100}px;--r:${Math.random() * 900 - 450}deg`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  };
  const burstParticles = (x, y, colors, count = 28) => {
    if (RM) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      p.className = "cf";
      const a = Math.random() * Math.PI * 2,
        v = 60 + Math.random() * 170;
      const isCircle = i % 2 === 0;
      const size = isCircle ? (3 + Math.random() * 5) : (5 + Math.random() * 7);
      p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${isCircle ? '50%' : '2px'};box-shadow:0 0 6px ${colors[i % colors.length]};--dx:${Math.cos(a) * v}px;--dy:${Math.sin(a) * v + 60}px;--r:${Math.random() * 720 - 360}deg`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  };
  $("kp").addEventListener("click", (e) => {
    const k = e.target.closest(".k");
    if (!k) return;
    const r = k.getBoundingClientRect(),
      cx = r.left + r.width / 2,
      cy = r.top + r.height / 2;
    if (!RM) {
      k.style.animation = 'none';
      void k.offsetWidth;
      k.style.animation = 'springBounce 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => k.style.animation = '', 700);

      const st = k.dataset.s;
      if (st == "पूर्ण") {
        conf(cx, cy);
      } else if (st == "प्रगति पर") {
        burstParticles(cx, cy, ["#f59e0b", "#fbbf24", "#f97316", "#ffffff", "#fef08a"]);
      } else if (st == "प्रारंभिक चरण") {
        burstParticles(cx, cy, ["#0ea5e9", "#38bdf8", "#0284c7", "#ffffff", "#bae6fd"]);
      } else if (st == "प्रारंभ नहीं") {
        burstParticles(cx, cy, ["#ef4444", "#f87171", "#dc2626", "#ffffff", "#fca5a5"]);
      }
    }
  });
  $("kp").addEventListener("pointermove", (e) => {
    const k = e.target.closest(".k");
    if (!k || RM || !matchMedia("(hover:hover)").matches) return;
    const r = k.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    k.classList.add("tilt");
    // Enhanced 3D tilt with depth
    k.style.transform = `perspective(600px) rotateX(${(-y * 12).toFixed(1)}deg) rotateY(${(x * 12).toFixed(1)}deg) translateY(-8px) scale(1.02)`;
    k.style.boxShadow = `${(x*20).toFixed(0)}px ${(y*20).toFixed(0)}px 40px color-mix(in srgb, var(--c) 35%, transparent)`;
  });
  $("kp").addEventListener("pointerout", (e) => {
    const k = e.target.closest(".k");
    if (k) {
      k.style.transform = "";
      k.style.boxShadow = "";
      setTimeout(() => k.classList.remove("tilt"), 180);
    }
  });
  // Magnetic hover on ALL cards (non-KPI)
  if (!RM && matchMedia("(hover:hover)").matches) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".card:not(.k)");
      if (card) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(1)}deg) rotateY(${(x * 4).toFixed(1)}deg) translateY(-5px)`;
      }
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest && e.target.closest(".card:not(.k)");
      if (card && !card.matches(":hover")) {
        card.style.transform = "";
      }
    });
  }
  const bt = $("bt");
  addEventListener("scroll", () => bt.classList.toggle("on", scrollY > 700), {
    passive: true,
  });
  bt.onclick = () => {
    if (!RM) {
      bt.classList.remove("bt-launch");
      void bt.offsetWidth;
      bt.classList.add("bt-launch");
      setTimeout(() => bt.classList.remove("bt-launch"), 550);
    }
    scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" });
  };
}
{
  let sp = document.getElementById("sp");
  if (!sp) {
    sp = document.createElement("div");
    sp.id = "sp";
    document.body.prepend(sp);
  }
  const u = () => {
    sp.style.transform =
      "scaleX(" +
      scrollY / (document.documentElement.scrollHeight - innerHeight || 1) +
      ")";
  };
  addEventListener("scroll", u, { passive: true });
  u();
  const it = cats
    .map(
      (c) =>
        `<span>${esc(c)}<b>${DATA.filter((d) => d.c == c).length}</b></span>`,
    )
    .join("");
  document
    .querySelector(".hero")
    .insertAdjacentHTML(
      "beforeend",
      `<div class="tk" aria-hidden="true"><div>${it + it}</div></div>`,
    );
  document.addEventListener(
    "pointermove",
    (e) => {
      const c = e.target.closest && e.target.closest(".card");
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      }
    },
    { passive: true },
  );
}
const io = new IntersectionObserver(
  (es) =>
    es.forEach((x) => {
      if (x.isIntersecting) {
        x.target.classList.add("in");
        io.unobserve(x.target);
      }
    }),
  { threshold: 0.12 },
);
render();
const obs = () =>
  document.querySelectorAll(".rv:not(.in)").forEach((e) => io.observe(e));
obs();
