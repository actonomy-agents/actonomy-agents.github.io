# Act\*ONOMY project website

The project website for **How to Interpret Agent Behavior** (NeurIPS 2026), featuring an interactive taxonomy and annotated agent trajectories.

[Website](https://actonomy-agents.github.io/) · [Paper](https://arxiv.org/abs/2605.13625) · [Code, data, and skills](https://github.com/gaojie058/iab-actonomy)

## What this repository contains

This repository maintains the website's static HTML, CSS, JavaScript, and display data. The research codebook, datasets, and analysis skills are maintained in **[gaojie058/iab-actonomy](https://github.com/gaojie058/iab-actonomy)**.

The website includes:

- **Home:** research overview, an annotation example, resource links, skill usage instructions, and citation.
- **Taxonomy explorer:** a searchable codebook and interactive radial map covering 10 actions, 46 subactions, and 120 leaf categories.
- **Reports:** a catalog of annotated agent trajectories.

All exploration runs in the browser. Online trajectory upload and model-based annotation are not implemented; follow the research repository's [quickstart](https://github.com/gaojie058/iab-actonomy#quickstart) to analyze your own trajectories with the skills.

## Preview locally

No package installation or build step is required. From this repository's root, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open **http://127.0.0.1:4173/**. You can also open `index.html` directly in a browser.

Useful pages:

- [Home](https://actonomy-agents.github.io/)
- [Taxonomy](https://actonomy-agents.github.io/browse.html#taxonomy)
- [Trajectory reports](https://actonomy-agents.github.io/trajectory-reports/index.html)
- [SWE-chat example](https://actonomy-agents.github.io/reports/c621c551.report.html)

## File layout

| File or directory | Purpose |
| --- | --- |
| `index.html` | Homepage, resource links, skill instructions, and citation |
| `browse.html` | Taxonomy explorer |
| `academic.css` | Page theme, typography, and responsive layouts |
| `styles.css` | Shared interactive component styles |
| `app.js` | Search, selection, trace navigation, evidence highlighting, and citation controls |
| `taxonomy-map.js`, `taxonomy-map.css` | Interactive radial taxonomy map |
| `data.js` | Embedded taxonomy, codebook, and trajectory snapshots |
| `assets/` | Logos and other visual assets |
| `reports/` | Full HTML reports that visitors can open interactively |
| `downloads/` | Retained data snapshots, source manifests, and the supplemental SWE-chat JSON |
| `.nojekyll` | Keeps GitHub Pages from processing the site with Jekyll |

## Resource links and website snapshots

Public research resources link directly to the current `main` branch of `iab-actonomy`:

| Resource | Canonical location |
| --- | --- |
| Codebook CSV and taxonomy JSON | [`data/taxonomy/`](https://github.com/gaojie058/iab-actonomy/tree/main/data/taxonomy) |
| Research datasets | [`data/`](https://github.com/gaojie058/iab-actonomy/tree/main/data) |
| Analysis skills and setup instructions | [Repository and quickstart](https://github.com/gaojie058/iab-actonomy#quickstart) |
| SWE-agent annotations and original trajectories | [`trajectory annotation examples/case2_swe_agent_two_traces/`](https://github.com/gaojie058/iab-actonomy/tree/main/trajectory%20annotation%20examples/case2_swe_agent_two_traces) |
| Extension instructions | [`CONTRIBUTING.md`](https://github.com/gaojie058/iab-actonomy/blob/main/CONTRIBUTING.md) |

The homepage command installs the current trajectory analysis skill directly from the research repository.

```sh
npx -y skills add gaojie058/iab-actonomy -y
```

The taxonomy explorer reads the local `data.js` snapshot. Updating the research repository or a download link does **not** automatically update the data displayed on the website. Refresh that snapshot separately when adopting new taxonomy or annotation data, and keep the displayed counts and source references consistent.

Full HTML reports remain in `reports/` so they render as interactive pages. The supplemental SWE-chat example `c621c551` also retains its local annotated JSON; it is not currently linked to an equivalent file in the research repository. The other files in `downloads/` preserve the study’s data snapshots and their provenance.

## Maintain and publish

Edit this repository directly. GitHub Pages publishes **`main` → `/ (root)`**, so there is no `dist/` or `docs/` directory to build or synchronize. Keep `.nojekyll` at the repository root.

For a typical update:

1. Edit the relevant HTML, CSS, JavaScript, or display data.
2. Preview locally and check the affected pages and links. For explorer changes, check taxonomy search, map selection, and trajectory navigation.
3. Run `git diff --check`, review the diff, and commit the intended files.
4. Push to `main`; GitHub Pages deploys the update. Check the repository's deployment status before assuming it is live.

The separate `Act-onomy-website` workspace is a historical development copy. It is not automatically synchronized with this repository or required to publish routine website edits.

## Sources and attribution

The two SWE-agent examples are `psf/requests-2317` and `django/django-14411`, from the research repository's case-study annotations. The supplied SWE-chat report `c621c551` contains 43 agent turns, 6 human inputs, and 113 quote annotations. It preserves the supplied annotations and outcome; human inputs are shown separately from agent behavior labels.

The examples illustrate observed behavior. Annotation counts are not quality scores, and case-study labels may include extensions beyond the released taxonomy.

[`downloads/source-manifest.json`](downloads/source-manifest.json) records hashes for the retained source snapshots. Its historical paths identify the original export layout, not the current research repository structure.

- **Codebook and labeled datasets:** [CC BY 4.0](https://github.com/gaojie058/iab-actonomy/blob/main/LICENSE-codebook).
- **Research tools:** [MIT](https://github.com/gaojie058/iab-actonomy/blob/main/LICENSE).
- **Third-party trajectories and supplied reports:** retain their original attribution.
- **NeurIPS logo:** the unmodified asset from the official [media kit](https://neurips.cc/public/MediaKit).

For the paper's BibTeX entry, see the website's [citation section](https://actonomy-agents.github.io/#citation).
