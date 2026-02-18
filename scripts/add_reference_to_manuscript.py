#!/usr/bin/env python3
"""Fetch a PubMed citation by PMID and append it to shared/reference.bib."""

import json
import re
import sys
import urllib.request
from pathlib import Path

ESUMMARY_URL = (
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    "?db=pubmed&retmode=json&id={pmid}"
)

REPO_ROOT = Path(__file__).resolve().parent.parent
BIB_FILE = REPO_ROOT / "manuscript" / "shared" / "reference.bib"


# ── helpers ──────────────────────────────────────────────────────────────────

def die(msg: str) -> None:
    print(f"Error: {msg}", file=sys.stderr)
    sys.exit(1)


def fetch_summary(pmid: str) -> dict:
    """Return the esummary record for a single PMID."""
    url = ESUMMARY_URL.format(pmid=pmid)
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        die(f"Failed to fetch PMID {pmid}: {e}")

    results = data.get("result", {})
    if pmid not in results:
        if "error" in results.get(pmid, {}):
            die(f"NCBI error: {results[pmid]['error']}")
        die(f"PMID {pmid} not found.")
    return results[pmid]


def make_citekey(rec: dict, pmid: str) -> str:
    """Build a cite key like 'ota2015positive' from the record."""
    first_author = rec.get("sortfirstauthor", "unknown")
    surname = first_author.split()[0].lower()
    # strip non-alpha
    surname = re.sub(r"[^a-z]", "", surname)

    year = re.match(r"\d{4}", rec.get("pubdate", ""))
    year = year.group(0) if year else "nodate"

    title_word = ""
    title = rec.get("title", "")
    for word in title.split():
        cleaned = re.sub(r"[^a-z]", "", word.lower())
        if len(cleaned) > 3:
            title_word = cleaned
            break

    return f"{surname}_{title_word}_{year}" if title_word else f"{surname}_{year}_{pmid}"


def format_authors(authors: list[dict]) -> str:
    """Convert [{'name': 'Ota T', ...}, ...] to 'Ota, T. and Maeda, M.'."""
    names = []
    for a in authors:
        if a.get("authtype") != "Author":
            continue
        parts = a["name"].rsplit(" ", 1)
        if len(parts) == 2:
            names.append(f"{parts[0]}, {parts[1]}.")
        else:
            names.append(parts[0])
    return " and ".join(names)


def extract_doi(rec: dict) -> str:
    eloc = rec.get("elocationid", "")
    m = re.search(r"10\.\S+", eloc)
    return m.group(0) if m else ""


def record_to_bibtex(rec: dict, pmid: str) -> str:
    """Convert an esummary record to a BibTeX @article entry."""
    key = make_citekey(rec, pmid)
    authors = format_authors(rec.get("authors", []))
    title = rec.get("title", "").rstrip(".")
    journal = rec.get("fulljournalname", rec.get("source", ""))
    year_match = re.match(r"\d{4}", rec.get("pubdate", ""))
    year = year_match.group(0) if year_match else ""
    volume = rec.get("volume", "")
    number = rec.get("issue", "")
    pages = rec.get("pages", "")
    doi = extract_doi(rec)

    fields = []
    fields.append(f"  title={{{title}}}")
    fields.append(f"  author={{{authors}}}")
    if journal:
        fields.append(f"  journal={{{journal}}}")
    if year:
        fields.append(f"  year={{{year}}}")
    if volume:
        fields.append(f"  volume={{{volume}}}")
    if number:
        fields.append(f"  number={{{number}}}")
    if pages:
        fields.append(f"  pages={{{pages}}}")
    if doi:
        fields.append(f"  doi={{{doi}}}")
    fields.append(f"  pmid={{{pmid}}}")

    body = ",\n".join(fields)
    return f"@article{{{key},\n{body}\n}}"


def key_exists(key: str) -> bool:
    """Check whether a cite key already exists in the bib file."""
    if not BIB_FILE.exists():
        return False
    content = BIB_FILE.read_text()
    return re.search(rf"@\w+\{{\s*{re.escape(key)}\s*,", content) is not None


def pmid_exists(pmid: str) -> str | None:
    """Return the cite key of an existing entry with this PMID, or None."""
    if not BIB_FILE.exists():
        return None
    content = BIB_FILE.read_text()
    # Match pmid = {XXXX} allowing whitespace variations
    pattern = rf"pmid\s*=\s*\{{{re.escape(pmid)}\}}"
    match = re.search(pattern, content)
    if not match:
        return None
    # Walk backwards from the match to find the cite key
    before = content[:match.start()]
    key_match = re.findall(r"@\w+\{([^,]+),", before)
    return key_match[-1].strip() if key_match else "unknown"


# ── main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].strip().isdigit():
        print(f"Usage: {sys.argv[0]} <PMID>")
        sys.exit(1)

    pmid = sys.argv[1].strip()
    print(f"Fetching PMID {pmid} …")

    rec = fetch_summary(pmid)
    bib = record_to_bibtex(rec, pmid)

    # Duplicate checks
    existing = pmid_exists(pmid)
    if existing:
        die(f"PMID {pmid} already exists in {BIB_FILE.name} as '{existing}'.")

    cite_key = bib.split("{", 1)[1].split(",", 1)[0]
    if key_exists(cite_key):
        die(f"Cite key '{cite_key}' already exists in {BIB_FILE.name}.")

    print()
    print(bib)
    print()

    answer = input("Add this entry to manuscript/shared/reference.bib? [Y/n] ").strip().lower()
    if answer in ("", "y", "yes"):
        with open(BIB_FILE, "a") as f:
            f.write("\n" + bib + "\n")
        print(f"✓ Appended as '{cite_key}' to {BIB_FILE}")
    else:
        print("Aborted.")


if __name__ == "__main__":
    main()
