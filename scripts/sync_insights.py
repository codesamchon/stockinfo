#!/usr/bin/env python3
"""
GitHub Issues -> data/insights.json Static Backup Synchronizer
- Fetches OPEN issues created by the repository OWNER (excludes PRs & third-party issues).
- Parses Line 1 URL, Summary text, Drag-and-drop Thumbnail image, and Labels.
- Writes data/insights.json so insights.html ("경제 이야기") never suffers from
  anonymous GitHub API rate limits (60 req/hr per IP).
"""

import json
import os
import re
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen

KST = timezone(timedelta(hours=9))
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_INSIGHTS_PATH = os.path.join(ROOT_DIR, "data", "insights.json")

DEFAULT_OWNER = "codesamchon"
DEFAULT_REPO = "stockinfo"


def extract_thumbnail_from_body(body: str) -> str:
    if not body:
        return ""
    # 1. Markdown image: ![alt](url)
    md_img = re.search(r"!\[[^\]]*\]\(\s*([^\s)]+)(?:\s+['\"][^'\"]*['\"])?\s*\)", body)
    if md_img:
        url = md_img.group(1).strip()
        if not url.lower().startswith(("javascript:", "data:")):
            return url
    # 2. HTML <img src="url">
    html_img = re.search(r"<img\b[^>]*?\bsrc=['\"]([^'\"]+)['\"]", body, re.IGNORECASE)
    if html_img:
        url = html_img.group(1).strip()
        if not url.lower().startswith(("javascript:", "data:")):
            return url
    return ""


def parse_line_as_link(line: str) -> str:
    """If the first non-empty line represents a target URL or relative page link, return it."""
    s = line.strip()
    if not s:
        return ""

    # Strip optional prefix like "링크:", "URL:", "주소:", "Link:"
    s = re.sub(r"^(?:링크|주소|url|link)\s*[:：]\s*", "", s, flags=re.IGNORECASE).strip()

    # Unwrap angle brackets <https://...>
    angle_m = re.fullmatch(r"<([^>\s]+)>", s)
    if angle_m:
        s = angle_m.group(1).strip()

    # Unwrap Markdown link [label](url) if the line is solely a markdown link
    md_link = re.fullmatch(r"\[[^\]]*\]\(\s*([^\s)]+)(?:\s+['\"][^'\"]*['\"])?\s*\)", s)
    if md_link:
        s = md_link.group(1).strip()

    lower = s.lower()
    if lower.startswith(("javascript:", "data:", "vbscript:")):
        return ""

    if lower.startswith(("https://", "http://", "./", "../", "/")):
        if " " not in s:
            return s

    # Relative html path without ./ prefix (e.g., "pages/story1.html" or "report.html")
    if re.fullmatch(r"[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*\.html?(?:[?#][^\s]*)?", s):
        return f"./{s}"

    return ""


def clean_markdown_text(text: str) -> str:
    s = re.sub(r"```[\s\S]*?```", " ", text)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"^[#>*\-\s]+", "", s, flags=re.MULTILINE)
    s = re.sub(r"[*_~]+", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def parse_issue_item(issue: dict, repo_owner: str) -> dict | None:
    if not isinstance(issue, dict):
        return None
    # Exclude Pull Requests
    if "pull_request" in issue:
        return None
    if str(issue.get("state", "")).lower() != "open":
        return None

    author_login = str((issue.get("user") or {}).get("login", "")).strip()
    assoc = str(issue.get("author_association", "")).upper()
    if author_login.lower() != repo_owner.lower() and assoc != "OWNER":
        return None

    raw_body = str(issue.get("body") or "")
    thumbnail_url = extract_thumbnail_from_body(raw_body)

    # Remove HTML comments and image tags before scanning lines
    stripped = re.sub(r"<!--[\s\S]*?-->", "", raw_body)
    stripped = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", stripped)
    stripped = re.sub(r"<img\b[^>]*>", "", stripped, flags=re.IGNORECASE)

    non_empty_lines = [ln.strip() for ln in stripped.splitlines() if ln.strip()]

    link_url = ""
    summary_lines = non_empty_lines
    if non_empty_lines:
        detected = parse_line_as_link(non_empty_lines[0])
        if detected:
            link_url = detected
            summary_lines = non_empty_lines[1:]

    html_url = str(issue.get("html_url") or "")
    final_url = link_url or html_url

    summary_raw = " ".join(summary_lines)
    summary_clean = clean_markdown_text(summary_raw)
    if len(summary_clean) > 220:
        summary_clean = summary_clean[:217].rstrip() + "..."

    labels_out = []
    for lbl in issue.get("labels") or []:
        if isinstance(lbl, dict) and lbl.get("name"):
            raw_c = re.sub(r"[^0-9a-fA-F]", "", str(lbl.get("color") or ""))
            hex_c = f"#{raw_c[:6]}" if len(raw_c) >= 6 else "#3B6FD8"
            labels_out.append({"name": str(lbl["name"]).strip(), "color": hex_c})

    return {
        "id": issue.get("id"),
        "number": issue.get("number"),
        "title": str(issue.get("title") or "").strip(),
        "linkUrl": final_url,
        "hasCustomLink": bool(link_url),
        "issueUrl": html_url,
        "thumbnailUrl": thumbnail_url,
        "summary": summary_clean,
        "labels": labels_out,
        "createdAt": str(issue.get("created_at") or ""),
        "updatedAt": str(issue.get("updated_at") or ""),
    }


def sync_insights_json(out_path: str = OUT_INSIGHTS_PATH) -> list:
    now_kst = datetime.now(KST)
    repo_slug = os.environ.get("GITHUB_REPOSITORY", f"{DEFAULT_OWNER}/{DEFAULT_REPO}").strip()
    if "/" in repo_slug:
        owner, repo = repo_slug.split("/", 1)
    else:
        owner, repo = DEFAULT_OWNER, DEFAULT_REPO

    api_url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open&creator={owner}&per_page=100"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "stockinfo-insights-sync/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    gh_token = os.environ.get("GITHUB_TOKEN", "").strip()
    if gh_token:
        headers["Authorization"] = f"Bearer {gh_token}"

    items_out = []
    try:
        req = Request(api_url, headers=headers)
        with urlopen(req, timeout=18) as resp:
            raw_list = json.loads(resp.read().decode("utf-8", errors="ignore"))
        if isinstance(raw_list, list):
            for raw_issue in raw_list:
                parsed = parse_issue_item(raw_issue, owner)
                if parsed and parsed["title"]:
                    items_out.append(parsed)
    except Exception as exc:
        print(f"[WARN] GitHub Issues sync skipped ({exc}); preserving existing insights.json if available.")
        if os.path.exists(out_path):
            try:
                with open(out_path, "r", encoding="utf-8") as f:
                    prev = json.load(f)
                    return prev.get("items", [])
            except Exception:
                pass
        return []

    payload = {
        "owner": owner,
        "repo": repo,
        "updatedAt": now_kst.isoformat(),
        "updatedLabel": now_kst.strftime("%Y년 %m월 %d일 %H:%M 기준").replace(" 0", " "),
        "count": len(items_out),
        "items": items_out,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"[INFO] Synced {len(items_out)} open owner insight(s) -> {out_path}")
    return items_out


if __name__ == "__main__":
    sync_insights_json()
