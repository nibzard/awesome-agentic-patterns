## PR intent

- [ ] Adds a reusable, generalized pattern (not a product announcement).
- [ ] One pattern per PR.
- [ ] If this PR only adds a tool or vendor link to an existing pattern, the tool replaces a deprecated reference or demonstrates a materially distinct mechanism, and the pattern stays within the 3-5 Known Implementations cap.

## Differentiation & status justification

- **Closest existing pattern(s):** <!-- Name 1-3 existing files in patterns/ -->
- **How this is distinct (why not a section in an existing pattern):**
- **Proposed status tier (`proposed` / `emerging` / `production` / `foundational`) and evidence:** <!-- Note: single contributor-owned repos or launch-stage tools must start as `proposed`. -->

## Reviewer checklist

- [ ] Problem, Solution, and Trade-offs are clearly documented.
- [ ] No marketing language or calls to action in the PR description or diff content.
- [ ] The pattern is not tied to a single brand as its primary value proposition.
- [ ] Public references are included; if self-referencing, additional context from third-party or non-affiliated sources is provided when available.
- [ ] Conflict-of-interest disclosures are included where applicable.
- [ ] `bun run validate:patterns:content` passes with 0 errors, and the `bun run build:data` output is committed.

## Notes

If this PR uses your own implementation as a reference, include in the pattern:

- `based_on`/`source` disclosure
- explicit framing that the write-up is about the pattern, not the product
