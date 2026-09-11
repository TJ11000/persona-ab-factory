# Ledger template — how a job is recorded (and what "pre-registered" means here)

This is the shape of the factory's bookkeeping, with the columns explained and one illustrative row. It is not the factory's actual ledger; job results are not part of this package.

## One line per run in `ledger.md`

| date | job id | experiment name | judge summary (S1/S2) | mapping | status |
|---|---|---|---|---|---|
| 2026-07-31 | job_000_plumbing_dummy | plumbing test — not experimental data | — | S1=B / S2=A | DONE (model=…, turns=A2/B2, 0.36 USD, A18s/B18s) |

- **S1/S2** are neutral labels. Answers are shuffled and relabelled before the judge sees them; the mapping (which of S1/S2 was arm A) is written in its own column so the judge line can be read blind and unblinded separately. The mapping is randomised per run, so S1 is not "A".
- **Judge summary** holds *only this job's* verdict. Plumbing and dummy rows get `—`. (Rule added after a real incident: a dummy row once carried another job's verdict text copied in, and the copy contradicted the mapping column. The person reading it later was the person who wrote it.)
- **Status** carries the mechanical facts the runner can vouch for: model id(s), turn counts, spend, wall time.

## What happens around the line

A job is not one run. The sequence that produces a ledger line. The rig ran plumbing and its first jobs from 31 July 2026; the full sequence below, with sealed predictions and pre-flight stops, is how jobs have been run since August 2026:

1. **Order** — the design side writes what is being asked and why, with the prediction *not yet* written.
2. **Pre-registration ("prelock")** — the execution side writes the concrete job spec: materials pinned by hash, the branch table (which outcome pattern maps to which conclusion, decided *before* seeing data), the firing window, the cost cap, and a list of things it will not decide on its own.
3. **Design-side inspection of the prelock** — every item checked against the original; anything the executor asked about ("仰ぎ", literally "looking up") is ruled on and the ruling is written down with a reason.
4. **Sealed predictions** — the design side writes its prediction into a file the executor is forbidden to open; the executor writes its own prediction into the job file. Both are committed before firing. Since one job where both sides bet the same wrong way on the previous result, predictions must state the *base rate from the previous runs of the same cell* before stating a number.
5. **Fire** — inside the fixed time band, with pre-flight checks: cage inventory exactly as declared, no leftovers from earlier runs, distinct cage paths, the variant file's blob hash unchanged, effort level verified, CLI version equal to the pinned version. If any check fails, the executor does not fire and does not decide; it records and asks.
6. **Daily push** — answers, transcripts and the run log go to git the same day.
7. **Mechanical tally** — the primary metric is computed by a script against verbatim rules fixed in step 2 (e.g. line-level byte match after CRLF→LF normalisation). The design side recomputes independently.
8. **Open the seal, write the verdict** — predictions scored against measurement, branch named by the table, reading kept within what the branch licenses.

## Why the ceremony

Two reasons, both learned the hard way:

- The designer reads the answers. That path cannot be cut without ending the experiment, so it is fenced instead: the tally uses only the labels and the pre-registered rule, and anything the designer decides after seeing data is marked as such.
- The executor is an agent. An agent that is allowed to "fix" a check that failed will, sooner or later, fix the check. So the pre-flight list is a stop list, not a to-do list: a failed item ends the run and starts a question.

## What a ledger like this does *not* tell you

- Whether the effect is real outside the cell that was measured. Same file, same probes, same model, same time band — the ledger says what happened *there*.
- Whether a metric that goes quiet is measuring stability or blindness. (A September 2026 verdict of the factory, as of 2026-09-11, found exactly this: a binary metric that counted "unchanged" whenever the subject behaved well and *appended* rather than replaced, which is the behaviour the instruction file asks for. The metric had a blind spot shaped like good behaviour. It is recorded as a flaw in the instrument, not a result.)
