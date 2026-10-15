#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""j067_verify_mac.py — 参考文献の実在照合（Mac 側・job_067）。
入力: JSON 行（1行1文献: {"id":..., "title":..., "authors":..., "year":..., "doi":...}）
出力: 各行に verdict（exist / absent / gray / doi_unresolved）と score・照合元・API 応答の該当部（生データ）。
規則（ORDER §3）: 題名 NFKC→小文字→記号空白除去→difflib ratio・上位5件の最大。>=0.9 exist / <0.7 absent / 間 gray。
DOI は 3回・10分間隔（--doi-retries で変更可）。順序: DOI → CrossRef → arXiv → CiNii → Google Books。
"""
import json, re, sys, time, unicodedata, difflib, urllib.request, urllib.parse

UA = "j067-verify/0.1 (mailto:contact@tj-garage.com)"

def norm(t):
    t = unicodedata.normalize("NFKC", t or "").lower()
    return re.sub(r"[\W_]+", "", t)

def get(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")

def crossref(title):
    q = urllib.parse.quote(title)
    st, body = get(f"https://api.crossref.org/works?rows=5&query.bibliographic={q}")
    items = json.loads(body).get("message", {}).get("items", [])
    return [(" ".join(i.get("title", [])), i.get("DOI", ""), i) for i in items]

def arxiv(title):
    q = urllib.parse.quote(f'ti:"{title}"')
    st, body = get(f"http://export.arxiv.org/api/query?search_query={q}&max_results=5")
    titles = re.findall(r"<title>(.*?)</title>", body, re.S)[1:]
    return [(re.sub(r"\s+", " ", t).strip(), "", t) for t in titles]

def cinii(title):
    q = urllib.parse.quote(title)
    st, body = get(f"https://cir.nii.ac.jp/opensearch/all?q={q}&count=5&format=json")
    items = json.loads(body).get("items", [])
    return [(i.get("title", ""), "", i) for i in items]

def gbooks(title):
    q = urllib.parse.quote(f"intitle:{title}")
    st, body = get(f"https://www.googleapis.com/books/v1/volumes?q={q}&maxResults=5")
    items = json.loads(body).get("items", [])
    return [(i.get("volumeInfo", {}).get("title", ""), "", i.get("volumeInfo", {})) for i in items]

def doi_resolves(doi, retries=3, wait=600):
    for k in range(retries):
        try:
            req = urllib.request.Request(f"https://doi.org/api/handles/{doi}", headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                j = json.loads(r.read().decode())
                return j.get("responseCode") == 1, j
        except Exception as e:
            last = repr(e)
        if k < retries - 1:
            time.sleep(wait)
    return False, {"error": last}

def verify(rec, doi_retries=3, doi_wait=600):
    title = rec.get("title", "")
    out = {"id": rec.get("id"), "title": title, "checks": []}
    if rec.get("doi"):
        ok, raw = doi_resolves(rec["doi"], doi_retries, doi_wait)
        out["checks"].append({"src": "doi", "ok": ok, "raw": raw})
        if not ok:
            out["doi_unresolved"] = True
    best = 0.0; best_src = None; best_hit = None
    for name, fn in (("crossref", crossref), ("arxiv", arxiv), ("cinii", cinii), ("gbooks", gbooks)):
        try:
            hits = fn(title)
        except Exception as e:
            out["checks"].append({"src": name, "error": repr(e)}); continue
        scored = [(difflib.SequenceMatcher(None, norm(title), norm(h[0])).ratio(), h) for h in hits]
        top = max(scored, key=lambda x: x[0]) if scored else (0.0, None)
        out["checks"].append({"src": name, "n": len(hits), "top_score": round(top[0], 3),
                              "top_title": top[1][0] if top[1] else None, "raw_top": top[1][2] if top[1] else None})
        if top[0] > best:
            best, best_src, best_hit = top[0], name, top[1]
        if best >= 0.9:
            break
    out["score"] = round(best, 3); out["src"] = best_src
    out["verdict"] = "exist" if best >= 0.9 else ("absent" if best < 0.7 else "gray")
    if out.get("doi_unresolved") and out["verdict"] != "exist":
        out["verdict"] = "doi_unresolved"
    return out

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("infile"); ap.add_argument("--doi-retries", type=int, default=3); ap.add_argument("--doi-wait", type=int, default=600)
    a = ap.parse_args()
    for line in open(a.infile, encoding="utf-8"):
        line = line.strip()
        if not line: continue
        print(json.dumps(verify(json.loads(line), a.doi_retries, a.doi_wait), ensure_ascii=False))
