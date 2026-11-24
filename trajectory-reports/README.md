# Trajectory reports

Browse 315 Act-onomy annotation reports covering 105 agent runs and 24,742 quote-level annotations. Each report pairs a browser view with machine-readable JSON.

[Interactive catalog](index.html) · [Download the catalog as CSV](catalog.csv) · [Project homepage](../index.html#trajectory-reports)

Open `index.html` in a browser from a local copy to search across datasets, trajectory sources and annotators.

| Benchmark or collection | Tasks | Recorded runs | Reports |
| --- | ---: | ---: | ---: |
| [SWE-bench Verified](benchmarks/swe-bench/verified/README.md) | 30 | 30 | 90 |
| [SWE-bench Lite](benchmarks/swe-bench/lite/README.md) | 25 | 25 | 75 |
| [SWE-bench · dev](benchmarks/swe-bench/dev/README.md) | 1 | 1 | 3 |
| [SWE-bench-extra](benchmarks/swe-bench-extra/README.md) | 24 | 24 | 72 |
| [GSM-Plus](benchmarks/gsm-plus/README.md) | 25 | 25 | 75 |

## Reading the catalog

Each CSV row links to one report. For each agent run, the catalog includes the latest completed annotation from each named model. Where several protocols cover the same run, the revision using the ambiguity case library takes precedence over the baseline. The later Contract v3 revision takes precedence over the earlier library run.

The generator produced the trajectory. The annotator applied the Act-onomy codebook. The CSV records the batch, annotation protocol and checksums for each report. The `trajectory_url` field opens an online preview of the run. The `original_trajectory_url` field preserves the original source link. The `source_url` field identifies its collection.

## Attribution

Act-onomy annotations use the project’s [data license](https://github.com/gaojie058/iab-actonomy/blob/main/LICENSE-codebook). Dataset pages link to the upstream trajectory sources and their terms. See the project [citation](https://github.com/gaojie058/iab-actonomy/blob/main/CITATION.cff) for the codebook and cite the upstream collection when reusing its traces.
