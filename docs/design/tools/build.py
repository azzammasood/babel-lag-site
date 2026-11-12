"""Build docs/design/preview.html from preview.src.html, the sample-data copies and the logos.

Only reads docs/design/sample-data (copies of babel-lag exports). Derived values are plain
sums/selections of those rows; nothing is estimated. Also refreshes the contrast blocks in
options.md between <!-- palette:NAME --> markers.
"""

import json
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
DESIGN = HERE.parent
SD = DESIGN / "sample-data"


def load(name):
    return json.loads((SD / name).read_text(encoding="utf-8"))


def lum(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    hi, lo = sorted([lum(a), lum(b)], reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def matrix(rows, per_wiki, hours):
    """Per-wiki events per measured hour (all wikis, ordered by window total)."""
    hi = {h: i for i, h in enumerate(hours)}
    order = sorted(per_wiki, key=lambda w: -per_wiki[w]["events"])
    wi = {w: i for i, w in enumerate(order)}
    m = [[0] * len(hours) for _ in order]
    for r in rows:
        m[wi[r["wiki"]]][hi[r["hour"]]] += r["events"] or 0
    return {"wikis": order, "events": m}


def bundle():
    lang, live, pm = load("languages.json"), load("live.json"), load("pipeline_metrics.json")
    cat, glo, lin = load("metadata_catalog.json"), load("metadata_glossary.json"), load(
        "metadata_lineage.json"
    )
    keys = ["events", "human_article_edits", "new_articles", "bot_events", "late_events"]
    hourly = defaultdict(lambda: dict.fromkeys(keys, 0))
    per_wiki = defaultdict(lambda: dict.fromkeys(keys, 0))
    for r in live["rows"]:
        for k in keys:
            hourly[r["hour"]][k] += r[k] or 0
            per_wiki[r["wiki"]][k] += r[k] or 0
    slice_wikis = {r["wiki"] for r in lang["rows"]}
    top = sorted(per_wiki.items(), key=lambda kv: -kv[1]["events"])[:10]
    env = lambda d: {  # noqa: E731
        k: d[k] for k in ("generated_at", "produced_by", "window", "sources", "privacy", "row_count")
    }
    return {
        "languages": {"meta": env(lang), "rows": lang["rows"]},
        "live": {
            "meta": env(live),
            "wikis": len(per_wiki),
            "hourly": [{"hour": h, **v} for h, v in sorted(hourly.items())],
            "totals": {k: sum(v[k] for v in per_wiki.values()) for k in keys},
            "slice": {w: per_wiki.get(w) for w in sorted(slice_wikis)},
            "top": [{"wiki": w, **v} for w, v in top],
            "matrix": matrix(live["rows"], per_wiki, sorted(hourly)),
        },
        "pipeline": {k: pm[k] for k in pm},
        "catalog": {"completeness": cat["completeness"], "datasets": len(cat["datasets"])},
        "glossary": [t["term"] for t in glo["terms"]],
        "lineage": {"nodes": len(lin["nodes"]), "edges": len(lin["edges"]),
                    "layers": sorted({n.get("layer") for n in lin["nodes"] if n.get("layer")})},
    }


def contrast_md(p):
    rows = ["| role | light hex | on bg | dark hex | on bg |", "| --- | --- | --- | --- | --- |"]
    for k in ("bg", "surface", "text", "muted", "accent", "data", "dim"):
        lv, dv = p["light"][k], p["dark"][k]
        if k in ("bg", "dim"):
            note = "background" if k == "bg" else "decorative only (empty/off states, never text)"
            rows.append(f"| {k} | `{lv}` | {note} | `{dv}` | {note} |")
            continue
        rows.append(
            f"| {k} | `{lv}` | {ratio(lv, p['light']['bg']):.2f}:1 | `{dv}` | "
            f"{ratio(dv, p['dark']['bg']):.2f}:1 |"
        )
    return "\n".join(rows)


def main():
    pal = json.loads((HERE / "palettes.json").read_text(encoding="utf-8"))
    for name, p in pal.items():
        for mode in ("light", "dark"):
            for k in ("text", "muted", "accent", "data"):
                r = ratio(p[mode][k], p[mode]["bg"])
                s = ratio(p[mode][k], p[mode]["surface"])
                assert min(r, s) >= 4.5, (name, mode, k, r, s)
    logos = {f.stem: f.read_text(encoding="utf-8") for f in sorted((DESIGN / "logos").glob("*.svg"))}
    src = (HERE / "preview.src.html").read_text(encoding="utf-8")
    data = json.dumps(bundle(), ensure_ascii=False, separators=(",", ":"))
    out = (
        src.replace("/*__DATA__*/null", data)
        .replace("/*__PALETTES__*/null", json.dumps(pal))
        .replace("/*__LOGOS__*/null", json.dumps(logos, ensure_ascii=False))
    )
    (DESIGN / "preview.html").write_text(out, encoding="utf-8", newline="\n")
    opt = DESIGN / "options.md"
    if opt.exists():
        t = opt.read_text(encoding="utf-8")
        for name, p in pal.items():
            t = re.sub(
                rf"(<!-- palette:{name} -->\n)(?:(?!<!-- palette:).)*?(<!-- /palette -->)",
                lambda m, p=p: m.group(1) + contrast_md(p) + "\n" + m.group(2),
                t,
                flags=re.S,
            )
        opt.write_text(t, encoding="utf-8", newline="\n")
    print("preview.html", len(out) // 1024, "KiB; logos", list(logos))


if __name__ == "__main__":
    main()
