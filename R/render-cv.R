# CV section rendering, driven by YAML fetched from the private ConnorB/CV
# repo during the CI build. Currently only the Teaching page is rendered from
# YAML; the CV itself is served as a PDF (see cv.qmd). Sourced by teaching.qmd.

source("R/render-pubs.R")  # esc(), %||%

# Read a fetched YAML file, always returning a list (never NULL)
read_cv_yaml <- function(path) {
  raw <- tryCatch(yaml::read_yaml(path), error = function(e) {
    warning(sprintf("Failed to read %s: %s", path, conditionMessage(e)), call. = FALSE)
    list()
  })
  if (is.null(raw)) list() else raw
}

# A right-floated, muted date range (e.g. "Fall 2024, Fall 2025")
dates_span <- function(d) {
  d <- as.character(d %||% "")
  if (!nzchar(d)) return("")
  sprintf('<span class="float-end text-muted">%s</span>', esc(d))
}

# --- Teaching --------------------------------------------------------------
render_teaching <- function(path = "_data/teaching.yaml") {
  items <- read_cv_yaml(path)
  if (!length(items)) return("<p>No teaching listed.</p>")
  parts <- lapply(items, function(e) {
    role_org <- c(esc(e$title %||% ""), esc(e$organization %||% ""))
    role_org <- paste(role_org[nzchar(role_org)], collapse = " • ")
    sprintf('
<div class="mb-4 pb-3 border-bottom">
  <div class="h5 mb-1">%s %s</div>
  <div class="text-muted mb-1"><em>%s</em></div>
  <div>%s</div>
</div>',
      esc(e$course %||% e$title %||% ""), dates_span(e$dates),
      role_org,
      esc(trimws(e$description %||% ""))
    )
  })
  paste(unlist(parts), collapse = "\n")
}
