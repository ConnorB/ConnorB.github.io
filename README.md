# ConnorB.github.io

Source for my personal website, [ConnorB.github.io](https://ConnorB.github.io). Built with [Quarto](https://quarto.org), rendered with R, and deployed to GitHub Pages via GitHub Actions.

## Site structure

The site is a Quarto website (`_quarto.yml`) using the `darkly` theme with custom SCSS/CSS. Each top-level page is a `.qmd` file:

| Page | Source | Notes |
| --- | --- | --- |
| About | [`index.qmd`](index.qmd) | Landing page and bio, with a rotating header image |
| Publications | [`publications.qmd`](publications.qmd) | Papers, datasets, and in-prep work, grouped by year |
| Software | [`software.qmd`](software.qmd) | R packages I maintain |
| CV | [`cv.qmd`](cv.qmd) | Embeds `CBrown_CV.pdf` with a download button |
| Teaching | [`teaching.qmd`](teaching.qmd) | TA history plus links to course materials |
| Courses | [`courses.qmd`](courses.qmd) | Course content, e.g. an [Intro to R](courses/field_ecology/intro2r/Intro2RPres.qmd) reveal.js deck |
| 404 | [`404.qmd`](404.qmd) | Custom not-found page |

### Directories

- `R/` — rendering helpers sourced by the `.qmd` pages. [`render-pubs.R`](R/render-pubs.R) holds shared utilities (HTML escaping, link buttons, year grouping) reused by [`render-software.R`](R/render-software.R) and [`render-cv.R`](R/render-cv.R).
- `_data/` — YAML driving the content-heavy pages (`publications.yaml`, `datasets.yaml`, `teaching.yaml`, `software.yaml`). The R scripts read these and emit HTML.
- `assets/` — CSS/SCSS, fonts, favicon, and images.
- `_extensions/` — vendored Quarto extensions (Font Awesome).
- `_freeze/` — Quarto's frozen computation cache (`freeze: auto`).
- `courses/` — standalone course materials.

## Data flow: the private CV repo

Most CV content is **not committed here**. The Publications and Teaching data (`_data/publications.yaml`, `_data/datasets.yaml`, `_data/teaching.yaml`) and the CV PDF (`CBrown_CV.pdf`) are fetched at build time from the private [`ConnorB/CV`](https://github.com/ConnorB/CV) repo, keeping this site as the single rendering layer while the CV stays separate. These paths are `.gitignore`d.

`software.yaml` is the exception — it lives in this repo directly.

This means a fresh local clone won't have publications/teaching/CV data until those files are present. The render scripts warn (rather than hard-fail) when a YAML file is missing, so the rest of the site still previews locally.

## Building locally

Requires [Quarto](https://quarto.org/docs/get-started/) and R with the `rmarkdown`, `downlit`, `xml2`, and `yaml` packages.

```bash
# Preview with live reload
quarto preview

# Render the full site to _site/
quarto render
```

To populate the Publications, Teaching, and CV pages locally, drop the corresponding YAML files into `_data/` and a `CBrown_CV.pdf` at the repo root (or supply them however the CI does — see below).

## Deployment

Pushes to `main` trigger the [`Quarto Publish`](.github/workflows/publish.yaml) workflow, which:

1. Installs Quarto and R (with code-linking dependencies from Posit binaries).
2. Fetches the latest CV YAML and newest dated CV PDF from the private `ConnorB/CV` repo using the `CV_TOKEN` secret.
3. Renders the site and publishes it to the `gh-pages` branch.

GitHub Pages serves `gh-pages` at [ConnorB.github.io](https://ConnorB.github.io).

## License

GNU General Public License v3.0 — see [`LICENSE`](LICENSE).
