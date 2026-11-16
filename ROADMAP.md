# Act\*ONOMY website development

Updated: 2026-10-15

## Current release: downloadable skills

- Offer a direct ZIP download containing the four skills, their dependencies,
  codebook, report templates, examples, and licenses.
- Explain how to open the extracted folder in a coding agent, supply a trajectory,
  and request a complete annotated HTML report.
- Validate the extracted package independently of the maintainer's checkout.
- Keep download generation reproducible and record archive/file hashes.

## Next phase: online trajectory analysis

Planned; not part of the current implementation.

User flow: upload one trajectory → choose a model/provider and enter a personal
API key → inspect the parsed input → run annotation → view and download the
interactive report and annotated JSON.

Implementation work:

1. Reuse the supported parsers and report schema; show unsupported-format errors
   before making model requests. Start with the existing SWE-agent message-list
   JSON and Claude Code session JSONL formats.
2. Add model orchestration for phase labels, quote-grounded codebook annotations,
   summaries, and findings. Process long traces in chunks with shared context.
3. Validate hierarchy labels, exact quote substrings, required fields, and complete
   turn coverage. Expose incomplete runs and retry failed portions.
4. Provide progress, cancellation, and usage information; preview the report and
   allow HTML/JSON downloads.
5. Select the deployment architecture after checking provider browser support.
   The current GitHub Pages site serves static files; a Python/model orchestration
   service would need separate hosting unless those steps are ported to the browser.
6. Define key and data handling before release: explain the provider receiving the
   trace, keep keys out of persistent storage and logs, discard session credentials,
   and treat uploaded trace text as data. Render generated reports in an isolated
   frame with appropriately escaped content.

Acceptance: a user can upload a supported trajectory and generate a report with
their own key, without a local coding agent. A failed or partial run is clearly
identified; annotation validation failures cannot be presented as a complete result.
