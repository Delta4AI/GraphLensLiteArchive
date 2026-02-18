# Graph Lens Lite — Publication

Multi-venue LaTeX setup for the Graph Lens Lite paper. The body content lives in
`shared/content.tex` and is rendered by two venue-specific drivers:

| Directory  | Target venue           |
|------------|------------------------|
| `oxford/`  | Oxford Bioinformatics  |
| `biorxiv/` | bioRxiv preprint       |

## Prerequisites

### Fedora

```bash
sudo dnf install \
  texlive-scheme-basic \
  texlive-latex \
  texlive-bibtex \
  texlive-natbib \
  texlive-acronym \
  texlive-hyperref \
  texlive-geometry \
  texlive-lineno \
  texlive-preprint \
  texlive-lm \
  texlive-enumitem \
  texlive-collection-fontsrecommended
```

### Ubuntu / Debian

```bash
sudo apt install \
  texlive-latex-base \
  texlive-latex-recommended \
  texlive-latex-extra \
  texlive-bibtex-extra \
  texlive-fonts-recommended
```

### macOS (Homebrew)

```bash
brew install --cask mactex
```

Or for a smaller footprint:

```bash
brew install --cask basictex
sudo tlmgr install natbib acronym preprint lineno enumitem lm
```

## Building

Each flavor is compiled from its own directory. A full build requires
`pdflatex` → `bibtex` → `pdflatex` → `pdflatex` (two extra passes resolve
cross-references and citations).

### Oxford Bioinformatics

```bash
cd oxford/
pdflatex main
bibtex   main
pdflatex main
pdflatex main
```

Output: `oxford/main.pdf`

### bioRxiv

```bash
cd biorxiv/
pdflatex main
bibtex   main
pdflatex main
pdflatex main
```

Output: `biorxiv/main.pdf`

### Build both at once

From the repository root:

```bash
for dir in oxford biorxiv; do
  (cd "$dir" && pdflatex main && bibtex main && pdflatex main && pdflatex main)
done
```

## Adding references

`tools/add-reference` fetches a PubMed citation by PMID and appends it to
`shared/reference.bib`. It requires only Python 3 (no extra packages).

```bash
./tools/add-reference <PMID>
```

The tool shows the generated BibTeX entry and asks for confirmation before
writing. Duplicate cite keys are rejected automatically.

## Repository structure

```
shared/
  content.tex              Body sections shared across venues
  abbreviations.tex        Acronym definitions
  reference.bib            Bibliography database
  Fig/                     Figures

oxford/
  main.tex                 OUP driver (structured abstract, journal metadata)
  oup-authoring-template.cls

biorxiv/
  main.tex                 Preprint driver (article class, line numbers)

tools/
  add-reference            Fetch PubMed citation → BibTeX (Python 3)
```

Edit `shared/content.tex` to change the paper body — both flavors pick up the
changes. For small venue-specific differences inside the shared content, use the
`\ifbiorxiv` flag:

```latex
\ifbiorxiv
  Supplementary data are available at \url{...}
\else
  Supplementary data are available at \textit{Bioinformatics} online.
\fi
```
