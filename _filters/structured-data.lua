-- Adds the site's JSON-LD structured data to <head>. The template is
-- _includes/structured-data.html; its __SAME_AS__ placeholder is filled from
-- the `social-links` list in _quarto.yml, so profiles are listed only once.

local template_path = quarto.project.directory .. "/_includes/structured-data.html"

function Meta(meta)
  local urls = {}
  for _, link in ipairs(meta["social-links"] or {}) do
    urls[#urls + 1] = pandoc.utils.stringify(link.url)
  end
  if #urls == 0 then error("No social-links found in _quarto.yml") end

  local file = assert(io.open(template_path, "r"))
  local template = file:read("a")
  file:close()

  -- "</" can't appear inside a <script> block.
  local same_as = quarto.json.encode(urls):gsub("</", "<\\/")
  local html, count = template:gsub("__SAME_AS__", function() return same_as end)
  if count ~= 1 then error("Expected one __SAME_AS__ placeholder in " .. template_path) end

  quarto.doc.include_text("in-header", html)
end
