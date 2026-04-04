# Skill: Adding a new Solution or Tool to SOLUTIONS.md

This skill provides instructions for Junie to analyze a new hacking guide, video, or tool, determine if it belongs in `SOLUTIONS.md` or `REFERENCES.md`, collect necessary metadata, and add it to the correct section f `SOLUTIONS.md` following the existing format.

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

## Common Formatting Rules

-   Use `*` for list items.
-   Links are in `[Title](URL)` format.
-   Mention authors with "by [Name](Link)".
-   The Juice Shop version is mentioned as `(🧃`vX.x`)`.
-   For non-English content, add the language code in parentheses, e.g., `(:de:)`, `(:es:)`.
-   **Everything** in `SOLUTIONS.md` is considered a spoiler, so individual icons like `:godmode:` are generally not used for the entry itself (unless it's a sub-item in a list that needs distinguishing).
