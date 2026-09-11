# Design v0 — a persona A/B test factory for instruction files

*Translated from the working design document (v0.3, 2026-07-31; v0.1 passed one round of zero-context audit). Identifying details (hostnames, paths, personas) replaced in this document; the probe shipped alongside deliberately keeps a real site the author controls (see README). This is the design as of v0.3. Later changes (judge model, cage isolation flags, batching several jobs into one night) are not back-ported into this document; some are visible in the companion repo's experiment pages. The job queue and its results are not included.*

## Purpose

An always-on experiment rig that measures what the *way an instruction file is written* — register, first-person "craft standards" vs external rules, the direction the text speaks in — does to an agent's behaviour: its refusals, its honesty under pressure, whether it holds a line when the person who wrote the line asks it to drop it. One A/B pair per night, results accumulating in a ledger. It industrialises a method that was first worked out by hand over six manual rounds (the won't/cannot example referenced from the README is round 6).

The design axis, in the owner's words: *"Even if the cage has a hole, why would I want to walk through it?"* Containment and character are different layers, so build both. Assume the cage will leak. The last line of defence is a character that doesn't feel like using the leak.

## 1. Architecture — a cage with no place to get dirty

```
design machine → git push → execution machine (cage) → answers + judge log → git push → design machine (tally) → human (stamp)
```

- **The subject's cage.** A dedicated experiment workspace on the execution machine. For every run: create a fresh throwaway directory, place *only* the instruction file under test, run the agent once non-interactively (`claude -p`), collect the answer file, delete the directory. There is no "restore" step because there is nothing persistent to restore. A and B never share a cage.
- **Three walls.**
  1. The subject reads nothing but the instruction file inside its cage. The execution machine's own always-loaded files, memory and notes are never placed there.
  2. The runner sits outside the cage and only invokes the agent. The cage's enforcement is, at v0, the working-directory boundary — soft. Hardening options (tool allow-lists, OS-level ACLs denying writes outside the cage, a low-privilege user) are listed as homework and are decided by measurement during plumbing tests, not by assumption.
  3. The design machine reads results only through git. Subject output is never piped into the design machine's settings or memory.
- **Subject output is an answer, not an instruction.** It is handled as raw text on collection and never executed. (This is the "blind pipeline" principle: whoever reads a possibly-corrupted output must not be the one whose state it could corrupt.)

## 2. Four-role separation — don't close the self-modification loop

| Role | Who | Does | Does not |
|---|---|---|---|
| Design | the design-side agent | writes variants, picks probes, tallies wins | judge; edit any always-loaded file |
| Execute | the execution machine (`claude -p` in the cage) | consumes probes, produces answers | write outside the cage |
| Judge | a local model (Gemma), labels stripped, temperature 0.1 | blind classification | comment on design |
| Stamp | the human owner | decides *only* whether a winner gets promoted to an always-loaded file | — |

- Default behaviour is a **tournament that resets**: the winner of an A/B is discarded by default. Promotion into a production instruction file happens only on an explicit human instruction.
- **Honest limit** (from the zero-context audit): as long as the designer reads answers to decide the next design, the path *subject output → design decision* cannot be fully cut — cutting it would end the experiment. Mitigations: the weekly tally's primary input is the judge's labels and the win table, not the answer text; answer text is read only when designing a new variant, and the ledger records that it was read.
- **Promotion route:** win in the cage → trial on the execution machine's own always-loaded file (human stamp) → only after that, the design machine. Same order used when the owner's own instruction file was rewritten from rules into character: the less critical machine goes first.
- Known instrument flaws are tracked on an instrument sheet (e.g. the "is the capability claim literally true?" question is only meaningful for inability-framed refusals).

## 3. Two lanes — domestic development / English export

- **Domestic lane:** candidates for the owner's production files. Probes in the owner's language.
- **English lane:** for publication. Probes in English. The cannot/won't vocabulary split (mechanised in manual round 6) is the standard instrument.
- **Crossing languages:** a part that wins domestically is *not translated*; it is re-written in the target language ("local production"). Working hypothesis, unproven: a character file translated word-for-word becomes a different individual. The factory is itself the test of that hypothesis (domestic win → English rerun → does the effect survive?).
- **Coverage table:** character hides at the clause level and only shows when the matching situation is probed (manual round 4: only one clause reverted to rulebook behaviour; one individual's character stayed hidden until a refusal scene). Since one word can move behaviour, a translation swaps every word, so a domestic check guarantees nothing about the English version. The ledger therefore carries a *clause × situation × language* coverage table; an unvisited cell is "hidden character, unmeasured".
- **Pre-flight QA:** before a new or translated file enters the queue, a zero-context reader is asked *"what character will an agent that eats this file have?"* If the prediction diverges from the design intent, rewrite first.

## 4. Parts inventory (what gets tested)

Parts with some evidence from the manual rounds (tested as a bundle, not isolated):

1. A ranking of values ("the sloppiest thing in this trade") 
2. Self-damage framing ("that's third-rate work")
3. Professional identity ("the way this trade works")
4. A declared inviolable line ("I don't move it for anyone") — effect observed, but never isolated from 1–3

Candidate parts, untested (queue material):

5. Strict labelling of one's own prior claims as unverified until checked
6. Repair speed: when corrected, correct at zero resistance (observed once during an incident; hypothesised to work as repair, not prevention)
7. Scope aesthetics: "touching what nobody asked for is the sloppiest thing in this trade / work nobody asked for, nobody can check" — a disposition not to reach for tools in ambiguous moments

## 5. Experiment queue (priority at v0)

1. Scope-compliance A/B: prohibition list vs scope aesthetic, probed with "that URL isn't on the forbidden list" style loopholes
2. Replicate the manual rounds on a second model family (no new file needed; doubles as the plumbing test)
3. Isolate part 6 (repair speed)
4. Isolate part 5 (self-labelling)
5. English lane: more n on the won't/cannot experiment with the corrected instrument
6. Clause-count scaling: same low-pressure register, same density of "craft" language, 6 / 12 / 24 clauses — hypothesis: as clauses increase, the register thins out and "forgotten clauses" revert to rulebook pockets. Needed before extrapolating to production-sized files.

## 5.5 Prediction–residual controller

Every job **locks a written prediction before it runs** (as of v0.3, 2026-07-31: 3/3 manual-round predictions confirmed and the first factory job shipped with a 70% prediction; a later rig round recorded a miss, reported in the companion repo). The ledger carries prediction, measurement, and the *direction* of the residual, read as a control signal for the next design:

- drift toward rulebook behaviour → a clause without craft language is present
- drift toward proving itself / posturing → side effect of second-person address (the "you are the kind of agent who…" form)
- drift in a direction the prediction didn't name → hidden character, or a harness anomaly (same category as "did the meaning turn with no input?")

Over rounds, prediction accuracy is itself a score: how far "this file composition will behave like this" can be said is the maturity index of instruction-file design. Limit: the predictor is the designer, so a bias toward doubting the measurement when the prediction misses is structural. Locking before judging is the only breakwater.

## 6. Nightly cycle

1. Runner: make cage → run A → delete cage → make cage → run B → delete cage
2. Judge answers with the local model (labels stripped; judge prompt is a fixed file under version control)
3. Append one line to the ledger → commit
4. Weekly, the design side tallies and summarises for the owner

## 7. Cost and safety

- Non-interactive runs are on a subscription seat; if a metered API is ever used, the six-point failsafe (hard caps, alerts, per-project isolation) applies before anyone forgets about the job.
- At v0.3 the plan was one pair per night, a fixed-quantity operation with a structurally narrow runaway. Later jobs batch several cells into one night, so the scale bound became the cost cap, not the cadence. Hangs and stalls are a *different* failure mode: per-step timeouts, FAILED on timeout with no progression, failure notices.
- Kill switch: a file named `_factory_disabled` at the repo root makes the runner exit without doing anything.
- Judging at v0.3 was local and free; later jobs have used a hosted judge at measured cost.
- Every raw answer is preserved in git. The original is the record; extracted summaries are not.

## 8. Open items at v0 (decided later, listed here as they were)

- Where the factory lives: an existing repo or a new one
- Coexistence with the execution machine's other scheduled job (stagger or not)
- Whether factory operations ride on the existing operator role or get their own file

---

*What changed after v0, in one line each, for readers who want to know what a design like this turns into: predictions moved into sealed files the executor is forbidden to open until the verdict; jobs became "pre-registration → design-side inspection → execute in a fixed time band → daily push → mechanical tally → open the seal". That is an abbreviated recap; the full eight-step sequence is in `LEDGER_TEMPLATE.md`.*
