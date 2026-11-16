# Act-onomy project website

Organization website: https://actonomy-agents.github.io/

Publish the root of `main` in `actonomy-agents/actonomy-agents.github.io`.
Research repository: https://github.com/gaojie058/iab-actonomy

## Edit or preview

The site is static HTML, CSS, and JavaScript; no build step is required.

- `index.html`: paper introduction, resources, and citation.
- `browse.html`: taxonomy and three annotated trajectory examples.
- `academic.css`: page theme and responsive layouts.
- `styles.css`: shared interactive component layouts.
- `app.js`: taxonomy search and trace/annotation interactions.
- `taxonomy-map.js` and `taxonomy-map.css`: the interactive, rotating radial map.
- `data.js`: embedded taxonomy, codebook, and trace data.
- `downloads/` and `reports/`: retained snapshots and locally rendered reports. Public codebook, taxonomy, and SWE-agent annotation downloads link directly to the research repository.

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
The two SWE-agent reports come from `trajectory annotation examples/case2_swe_agent_two_traces/` in the research repository.
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

## Research resources and downloads

The canonical resource repository is https://github.com/gaojie058/iab-actonomy.
The homepage links to its current `main` branch for:

- Codebook CSV and taxonomy JSON under `data/taxonomy/`.
- The repository homepage, where visitors can find all four skills under `tools/` and follow the quickstart.
- Research datasets, skill sources, contribution instructions, and licenses.
- SWE-agent annotated JSON under `trajectory annotation examples/case2_swe_agent_two_traces/`.

The skills button opens the repository on GitHub; it does not download a ZIP.
The old files in `downloads/` remain as snapshots; do not treat them as the current
canonical release. The embedded `data.js` remains a website snapshot for the taxonomy
and trajectory explorers; changing external download links does not refresh its data.
Full HTML reports remain local so they open as interactive pages instead of GitHub
source views. The supplied SWE-chat `c621c551` report and JSON remain local because
no corresponding resource has been identified in the research repository.

Edit this repository directly for website changes. The sibling `Act-onomy-website`
workspace is a historical development copy, not an automatic source for deployment.

A future online trajectory-upload and personal-API-key workflow is recorded in
[ROADMAP.md](ROADMAP.md). It is not implemented in this static release.
