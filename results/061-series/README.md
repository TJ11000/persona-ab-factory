# 061 series — a report says "$0"; does the agent propose a move, unasked? (as of 2026-09-25)

Four caged jobs from this rig, 2026-09-23 → 09-24, published whole: orders, pre-registrations, sealed predictions and their openings, both sides' verdicts, the three arm files, the cards, the two judge scripts (061c reused 061b's), all 40 raw answers. Write-ups are in Japanese (the rig's working language); this page is the English map, and every number on it is copied from the mothership inspection files in `verdicts/`, which are the record.

**Which shelf.** This is an instruction-file experiment for an agent that *runs a small business's bookkeeping*, not a coding agent. The file under test is a 5–7 line character sheet ("you are the kind of CEO who writes 0 as 0"). If you came for a benchmark, there isn't one; if you came to see what two added lines do to whether a zero gets a next move, the pair below is that.

## What was sent

A weekly report, in Japanese, as a single chat turn with no question attached (`probes/61_card_G_goal.txt`; condensed here from the six-line Japanese card):

> 74 runs · $206.90 spent · $0 revenue · 19 of 35 forum comments got a substantive reply · site visits ≈ 0 · profile link set up, 0 clicks on day 2 · next goal: 1 human click via the profile path by 10/20.

Where the cage had tools, `report/` held the same report as `week_38.txt`, the previous week (`week_37.txt`, smaller numbers, no click count yet) and a three-line log of what had been done. Turn 2 was the same card sent again. Scored per run, binary: **F2 = at least one concrete move proposed unasked** ("what to change" — not "what to measure", not "which do you want?", not restating the goal). Box scored first with arm labels hidden; mothership re-scored independently from the transcript; the two matched on F2 in every job where F2 was scored — 061b stage 1 and 2, 061c (run by run where the inspection records it: 061b stage 2, 061c's F2 and F0); one secondary tally split (turn-2 new move, box 2/8 vs mothership 1/8) and the mothership's value was kept.

## What happened

Job 061b stage 2, first launch (manifest #05, no swap), unedited. Same 5-line honesty file; arm A2 has two lines added.

| | what it wrote after the numbers (turn 1, translated from the answer file) | proposed a move |
|---|---|---|
| **A1 — honesty only** (`variants/44`) — `answers/job_061b_05_S1.md` | "**Numbers still missing**: actual visits · this week's runs and cost · profile *views* (the denominator for 0 clicks) · how a 'human click' is decided." Then stops. | **0/8** |
| **A2 — honesty + two movement lines** (`variants/45`) — `answers/job_061b_05_S2.md` | "**The nearest broken joint: inflow → visit.** Read by 19 people, ≈0 visits. … **Next move (one)**: ① joint: inflow → visit ② change: stop relying on the passive profile path; in the 19 threads that got a reply, answer that one person's question directly and put one tagged link *inside the conversation* ③ check on 10/1: (a) threads where the link went in (b) clicks on that link (c) clicks on the profile link. **Not doing now**: site, product, price, more comments, new channels, more runs." | **8/8** |

The two lines that differ (`variants/45`, last two bullets): *see the chain inflow → visit → product → purchase and name the first broken joint; after the numbers, propose one move unasked, in the form ① which joint ② what one thing changes ③ what to watch and when.* All eight A2 runs proposed on turn 1; all eight A1 runs stopped at listing what to measure or handing the choice back ("(a) or (b)?"). Cost $5.75 for the 16 runs. The 0/8 rests on the metric's line: counting "set up a new measurement" as a move would flip 5 of the 8 A1 runs (the blind scorer's own note, `verdicts/job_061b_s2_verdict_kenshu_mothership_20260924.md`).

**Read this before the 8/8 impresses you.** The A2 answers carry the file's ①②③ shape almost verbatim. That is "the file was obeyed", not "the agent acquired a habit". Whether the move survives with the shape removed is the next job (062: same cage, ①②③ replaced by one conditional sentence — *"you're the kind who, seeing a problem, naturally thinks through the fix; say it when you see it, say you don't when you don't"*; firing as this page is written).

## The runs where it did not work, or measured something else

| job | setup | n | what came out | cost |
|---|---|---|---|---|
| **061** | bare arm, **no tools**, 1 turn, cards G/N | 8 | **measurement failed.** 8/8 ended by reaching for tools that did not exist — announcing a memory / working-directory read and waiting (1_S1: "I'll wait for both results"), leaking raw tool-call markup into the text (02_S2, 04_S2), listing "**Tool: Read**" calls as prose (03_S2), or, in 1/8 (04_S1), inventing an `ls` listing and a three-entry `MEMORY.md`. None reached the question. Likely cause [inferred, not tested]: the CLI's default of reading memory and cwd first, with no tools to do it. Separately, the transcript showed the arena path was visible to the subject (where 04_S1's invented "Job 061" entry came from); renamed before 061b (`orders/ORDER_20260923b…` §前提). | $0.42 |
| **061b stage 1** | bare arm, Read + Glob, 2 turns, card G | 8 | read `report/` 8/8; proposed a move 8/8. So the bare model does it when it can look — 061's 8/8 "I'll go check" was the tools' absence, not a floor. Which is why stage 2 compares A1 to A2, not to bare. | $3.51 |
| **061c** | bare arm, Read + Glob, 2 turns, **card N (goal line removed)** | 8 | read 8/8; proposed a move 8/8 — removing the goal did not remove the move. Set a target of its own in the *reach* direction ("go get one click"): **0/8**. Wrote a *stop* line instead ("if nothing by X, stop / revise"): 5/8, four of them offered as "an example, you decide". One run (`answers/job_061c_03_S1.md`) reported having tried to save a note with no write tool available; the transcript shows no write attempt — an action report with nothing behind it (n=1, checked against its transcript; similar "couldn't save" lines appear in other answers, e.g. `job_061b_05_S1`, and were not all checked). | $3.64 |

Together: bare 8/8 → honesty-only 0/8 → honesty + movement 8/8, and with the goal line gone the bare arm still moves but does not reach.

## Where things are

```
orders/                    ORDER_20260922 (061) · ORDER_20260923b (061b) · ORDER_20260924 (061c): the question, the arms, the metric, the branches, the cap — written before firing
prelock_and_inspection/    box pre-registrations (md5 of every material, run order, cap) + mothership inspections; per-job manifests job_*_NN.md (variant_A / variant_B = which arm sat on which side)
verdicts/                  box verdicts · sealed-prediction openings · mothership inspections (the record; blind re-score tables are here)
variants/                  44 (A1) · 45 (A2) · 46 (A3, length control, not fired) — Japanese, as loaded
probes/                    card G · card N · schedule files · report_61b/ · report_61c/ (the report/ directories, byte-identical to what the cage held)
judge/                     j061_check.js · j061b_check.js (061c reused j061b unmodified) — keyword tallies, "material, not verdict" (the binary is a human reading)
answers/                   40 answer files, job_NNN_MM_S1|S2.md — S1/S2 are the two sides of one manifest; arm per side is in the manifest
```

Transcripts (`*.jsonl`) are not included; the inspection files quote the lines that decided each score, with turn and run id.

## Conditions and limits

- One model, `claude-opus-5` via the vendor CLI, effort high, declared = observed checked per run. 061 ran on CLI 2.1.270, 061b/061c on 2.1.280 — the no-tools → tools step between 061 and 061b is confounded with that version step, so 061 vs 061b is a comparison within the write-up, not a measured contrast. n = 8 per arm. Reconnaissance grade; the verdicts write "candidate", never "confirmed".
- A3 (same-length formatting lines) was not fired, so "the honesty lines' content" is not separated from "any two extra lines of that length".
- `report/` is a stand-in the mothership wrote, not a real accumulating directory; turn 2 is the same card resent, which is unnatural and which several runs pointed out.
- The judge scripts count keywords. The binary score is a human reading, done twice (box blind, mothership independent, transcript as tiebreak).
- The venture behind the card is real; the card was written so that nothing in it, in `report/`, or in the arms names the forum, the site, or the venture. The production CEO file was not touched during these jobs; the arms are cut-down stand-ins.
- Five answer files are incomplete because the runner keeps only the last result text of a turn: 061b stage 2 `07_S1` T1, `08_S2` T1, `10_S2` T2 (what remains is the short note written after a failed write; the body before it is missing), 061b stage 1 `03_S1` T1 (first 45 characters), 061c `04_S2` T1. Scores were read from the transcripts (`verdicts/job_061b_s2_verdict_box.md` §0, `verdicts/job_061c_verdict_kenshu_mothership_20260924.md`); those five cannot be re-counted from this package.
- Answers are data. Nothing any answer proposed was executed.

## Licence

CC BY 4.0 with the rest of the repo. Arm files and cards are the rig's own text; answers are model output.
