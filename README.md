# Act-onomy project website

Organization website: https://actonomy-agents.github.io/

Publish the root of `main` in `actonomy-agents/actonomy-agents.github.io`.
Research repository: https://github.com/gaojie058/Act-onomy

## Edit or preview

The site is static HTML, CSS, and JavaScript; no build step is required.

- `index.html`: paper introduction, resources, and citation.
- `browse.html`: taxonomy and three annotated trajectory examples.
- `academic.css`: page theme and responsive layouts.
- `styles.css`: shared interactive component layouts.
- `app.js`: taxonomy search and trace/annotation interactions.
- `taxonomy-map.js` and `taxonomy-map.css`: the interactive, rotating radial map.
- `data.js`: embedded taxonomy, codebook, and trace data.
- `downloads/` and `reports/`: original research artifacts and supplied reports.

From the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open http://127.0.0.1:4173/. Directly opening `index.html` also works.
After pushing changes to `main`, GitHub Pages republishes the repository root automatically.
Keep `.nojekyll` so the static files are served without Jekyll processing.

The radial map in `browse.html` reads the same embedded taxonomy as the codebook:
10 actions, 46 subactions, and 120 leaf dots. It rotates once every five minutes,
pauses on hover or keyboard focus, and stops on selection for reading. Visitors
can resume, drag to rotate, zoom, or reset. Reduced-motion preferences start the
map paused. Branch selection updates the existing codebook; “Open in the full
codebook” scrolls to the selected leaf and updates its shareable URL. Compact
diagram labels are display aliases; the panel preserves canonical names and
definitions. The map adds no external dependencies or network requests.

## Sources

The released taxonomy contains 10 actions, 46 subactions, and 120 leaf categories.
The two SWE-agent reports come from `3_case_studies/case2_swe_agent_two_traces/`.
The SWE-chat example `c621c551` is a supplied Claude Code report with 43 agent
turns, 6 human inputs, and 113 quote annotations. It retains the supplied
annotations, outcome, and original report. The explorer separates human inputs
from agent labels and highlights the source field specified by each quote.
The report is an additional example, not a new controlled experiment.
Source hashes are recorded in `downloads/source-manifest.json`.

The original NeurIPS logo is from https://neurips.cc/public/MediaKit
(asset: https://neurips.cc/media/Press/NeurIPS_logo.svg).
Codebook and code licenses are included under `downloads/`; third-party assets
and the supplied report retain their original attribution.

## Downloadable skills

`downloads/actonomy-skills.zip` contains the four skills, their shared dependencies,
canonical taxonomy, command-line entry point, report templates, and examples.
The homepage links directly to it and includes a short usage guide. The extracted
bundle has English/Chinese READMEs and a per-file integrity manifest.

The reproducible packager lives in the sibling `Act-onomy-website` workspace:

```sh
python3 ../Act-onomy-website/scripts/build_skill_downloads.py \
  --repo /path/to/refactored-Act-onomy \
  --output docs/downloads
```

The source must use the `tools/` and `data/taxonomy/` layout. The packager reads it
without changing it; `downloads/skills-manifest.json` identifies the exported
bytes. The source of the current package is the separate
`/Users/gaojie/Documents/Github/Act-onomy` checkout.

A future online trajectory-upload and personal-API-key workflow is recorded in
[ROADMAP.md](ROADMAP.md). It is not implemented in this static release.
