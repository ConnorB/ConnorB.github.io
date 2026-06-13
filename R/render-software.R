# Software / R-package rendering for software.qmd.
# Reuses the shared helpers (esc, %||%, btn) defined in render-pubs.R.
source("R/render-pubs.R")

render_software_entry <- function(e) {
  name  <- esc(e$name %||% e$title %||% "Untitled package")
  title <- esc(e$title %||% "")
  role  <- esc(e$role %||% "")
  desc  <- esc(e$description %||% "")

  # Link buttons (Docs / GitHub / CRAN / R-universe / ...), styled by label
  links <- character()
  if (!is.null(e$links) && length(e$links)) {
    map_style <- function(lbl) {
      lbl_l <- tolower(lbl)
      if (lbl_l %in% c("docs", "website", "documentation", "pkgdown")) "primary"
      else if (lbl_l %in% c("github", "code", "source")) "info"
      else if (lbl_l %in% c("cran", "r-universe", "r universe")) "success"
      else "secondary"
    }
    links <- vapply(e$links, function(li) {
      btn(as.character(li$text %||% ""), as.character(li$href %||% ""),
          map_style(as.character(li$text %||% "")))
    }, character(1))
  }
  links_html <- paste(links[links != ""], collapse = "")

  # Optional install snippet
  install_html <- if (!is.null(e$install) && nzchar(e$install)) {
    sprintf('<pre class="mb-2"><code>%s</code></pre>', esc(e$install))
  } else ""

  parts <- character()
  if (nzchar(title)) parts <- c(parts, title)
  if (nzchar(role))  parts <- c(parts, role)
  secondary <- paste(parts, collapse = " • ")

  sprintf('
<div class="mb-4 pb-3 border-bottom">
  <div class="h5 mb-1"><code class="pkg-name">%s</code></div>
  <div class="text-muted mb-2"><em>%s</em></div>
  <div class="mb-2">%s</div>
  %s
  <div>%s</div>
</div>
', name, secondary, desc, install_html, links_html)
}

# Load software.yaml and return rendered HTML for all entries
load_software <- function(path = "_data/software.yaml") {
  raw <- tryCatch(yaml::read_yaml(path), error = function(e) {
    warning(sprintf("Failed to read %s: %s", path, conditionMessage(e)), call. = FALSE)
    list()
  })
  if (is.null(raw) || !length(raw)) return("<p>No software listed yet.</p>")
  paste(vapply(raw, render_software_entry, character(1)), collapse = "\n")
}
