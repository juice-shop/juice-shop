---
name: add-solution
description: Instructions for adding new hacking guides, videos, or tools to SOLUTIONS.md
---

# Skill: Adding a new Solution or Tool to SOLUTIONS.md

This skill provides instructions for analyzing a new hacking guide, video, or tool, determining if it belongs in `SOLUTIONS.md` or `REFERENCES.md`, collecting necessary metadata, and adding it to the correct section of `SOLUTIONS.md` following the existing format.

## Repository Targets & Scope

- **Primary Target**: `SOLUTIONS.md`
- **Secondary Target (Redirect only)**: `REFERENCES.md` (when the entry represents general news, appearances, or non-solution articles)

## Source-of-Truth & Data Handling Rules

- **External Metadata**: The provided external URL / repository / video description is the primary source of truth for resource titles, authors, tools used, and walkthrough targets.
- **Challenge Ground Truth**: `data/static/challenges.yml` is the canonical source of truth for Juice Shop challenge names, keys, and official categories.
- **Version Baseline**: `package.json` provides the current application version when inferring recent Juice Shop compatibility tags (`🧃vX.x`).
- **Section Structure**: `SOLUTIONS.md` is the source of truth for section organization and formatting conventions.

## Change Boundaries

- **Allowed Changes**:
  - Adding or updating list entries in appropriate sections of `SOLUTIONS.md`.
  - Updating the Table of Contents in `SOLUTIONS.md` if section headings are modified.
  - Redirecting to `REFERENCES.md` if the resource does not provide solutions or exploit tooling.
- **Forbidden Changes**:
  - Modifying application source code (`server.ts`, `routes/`, `lib/`, `frontend/`).
  - Modifying challenge definitions in `data/static/challenges.yml` or codefixes in `data/static/codefixes/`.
  - Modifying test files, translation files, or build scripts.

## Ambiguity & Unmappable Source Handling

- **Unmatched Challenge Names**: If a walkthrough mentions challenge titles that do not match `data/static/challenges.yml`, check if the challenge was renamed historically or prompt the user for clarification before adding.
- **Missing Author or Version**: If author details or targeted Juice Shop versions cannot be determined from the source, ask the user instead of fabricating version tags.

## Distinguishing Between SOLUTIONS.md and REFERENCES.md

Unless the user explicitly specifies the target file, follow these rules:

1.  **SOLUTIONS.md**: Use this for content that is specifically a "how-to" for hacking Juice Shop or a tool that automates/assists in hacking it.
    -   *Walkthroughs*: Step-by-step guides for solving specific challenges.
    -   *Hacking Videos*: Screencasts of hacking sessions.
    -   *Scripts & Tools*: Python scripts, ZAP templates, etc., that solve or help solve challenges.
    -   *Spoilers*: Any content that contains full spoilers for challenges should ideally go here.

2.  **REFERENCES.md**: Use this for general mentions, news, blog posts about the project, conference talks, or appearances.
    -   *News*: Announcements of new releases, leadership changes, or project milestones.
    -   *General Mentions*: Blog posts or podcasts where Juice Shop is mentioned but not the primary focus or not a solution guide.
    -   *Appearances*: Conference or meetup talks, lectures, and trainings.
    -   *Educational*: General application security education that uses Juice Shop as an example but isn't a "how-to-solve-it" guide.

If in doubt, and the content contains spoilers (indicated by `:godmode:` or `:bulb:`), prefer `SOLUTIONS.md` if it is a guide/video/tool. If it is a blog post or talk, prefer `REFERENCES.md` with the appropriate icon.

## General Workflow

1.  **Analyze the Initial Prompt**: Identify the URL(s) and any provided metadata (author, title, tool name).
2.  **Crawl URL(s)**: Use the `bash` tool with `curl` or `fetch_url` to fetch the content of the provided link(s).
    -   Look for: Title, Author, Juice Shop version (🧃), Language code (e.g., `:de:`).
3.  **Determine Category**:
    -   [Hacking Videos](types/video.md)
    -   [Walkthroughs](types/walkthrough.md)
    -   [Scripts & Tools](types/tool.md)
4.  **Infer Metadata**:
    -   `🧃vX.x`: Look for the version of Juice Shop mentioned in the content. If not found, use the latest major version if the content is recent.
    -   `:broken_heart:`: Mark resources that rely on cheating (e.g., using hints or external tools not intended for the challenge).
    -   Language code: e.g., `(:de:)`, `(:es:)`, `(:id:)`.
5.  **Identify Missing Information**: If mandatory information (like the Juice Shop version or author) is missing, ask the user.
6.  **Find the Correct Section**: Locate the target section in `SOLUTIONS.md`.
7.  **Format the Entry**: Use the specific formatting rules for the identified type.
8.  **Update Table of Contents**: If a new top-level section is added (rare), update the TOC.
9.  **Skip Validation Commands**: Since `SOLUTIONS.md` is a plain text file, running `npm run lint`, `npm test`, or any other validation commands is unnecessary if *only* this file (and/or `REFERENCES.md`) was modified.

## Verification Expectations

- **Formatting Verification**: Manually check markdown syntax, link validity, author credit format (`by [Name](Link)`), and version badge notation (`(🧃`vX.x`)`).
- **Challenge Key Alignment**: Cross-reference any mentioned challenge name against `data/static/challenges.yml` to prevent broken references.
- **Validation Commands**: Skip `npm run lint`, `npm test`, or build commands when modifying only `SOLUTIONS.md` (and/or `REFERENCES.md`).
