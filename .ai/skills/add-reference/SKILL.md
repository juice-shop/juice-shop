---
name: add-reference
description: Instructions for adding new blog posts, talks, or other references to REFERENCES.md
---

# Skill: Adding a new Reference to REFERENCES.md

This skill provides instructions for analyzing a new reference (blog post, podcast, conference talk, etc.), determining if it belongs in `REFERENCES.md` or `SOLUTIONS.md`, collecting missing information, and adding it to the correct section of `REFERENCES.md` following the existing format.

## Repository Targets & Scope

- **Primary Target**: `REFERENCES.md`
- **Secondary Target (Redirect only)**: `SOLUTIONS.md` (when the entry represents a walkthrough, hacking video, or automated solve tool rather than a general reference)

## Source-of-Truth & Data Handling Rules

- **External Metadata**: The provided external URL / crawled web content is the primary source of truth for reference metadata (title, author, publication date, event name, talk slides/recordings).
- **Section Structure & Ordering**: `REFERENCES.md` is the canonical source of truth for existing category headings, subcategory structure, and reverse-chronological ordering conventions (e.g., years and dates descending).

## Change Boundaries

- **Allowed Changes**:
  - Appending or inserting formatted list entries into existing sections of `REFERENCES.md`.
  - Updating the Table of Contents in `REFERENCES.md` if a new year heading is created.
  - Redirecting and adding an entry to `SOLUTIONS.md` instead if the resource qualifies as a solution/exploit tool.
- **Forbidden Changes**:
  - Modifying application source code (`server.ts`, `routes/`, `lib/`, `frontend/`).
  - Modifying translation files, test suites, build configuration, or database files.
  - Creating new top-level categories in `REFERENCES.md` without explicit user instruction.

## Ambiguity & Unmappable Source Handling

- **Inaccessible or Paywalled Links**: If a link cannot be crawled or metadata cannot be confirmed from public page content, do not invent missing titles, authors, or dates. Prompt the user for the missing metadata.
- **Unclear Categorization**: If a reference does not fit neatly into one of the established types (e.g. mixed podcast/article), categorize it by primary medium (e.g. audio/video vs text) or confirm with the user.

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

1.  **Analyze the Initial Prompt**: Identify the URL(s) and any provided metadata (author, title, date, event name).
2.  **Determine Reference Type**: Based on the content and URL, categorize the reference into one of the supported types.
3.  **Crawl URL(s)**: Use the `bash` tool with `curl` to fetch the content of the provided link(s).
    - Look for: Title, Author, Date, Description.
    - Check for additional resources: If it's a blog post, check for an embedded video (YouTube, Vimeo, etc.). If it's a talk, look for slides or a video recording.
4.  **Infer Icons & Metadata**:
    - `:bulb:`: Content contains hints for solving challenges.
    - `:godmode:`: Content contains full challenge spoilers.
    - `:mega:`: Short shout-out or mention.
    - `:dollar:`: Commercial/paid resource.
    - `[:camera:]`: Link to a photo (common in Awards).
    - `(YouTube)`: If a video version is available for a podcast or blog.
5.  **Identify Missing Information**: If any mandatory information for the type is missing after crawling, ask the user for it.
6.  **Find the Correct Section**: Locate the target section in `REFERENCES.md`.
    - Note: Conference appearances are ordered by year (descending) and then roughly by date (descending).
7.  **Format the Entry**: Use the specific formatting rules for the identified type.
8.  **Update Table of Contents**: If a new year is added to "Conference and Meetup Appearances", update the TOC.
9.  **Skip Validation Commands**: Since `REFERENCES.md` is a plain text file, running `npm run lint`, `npm test`, or any other validation commands is unnecessary if *only* this file (and/or `SOLUTIONS.md`) was modified.

## Supported Types

Refer to the specific instructions for each type:

- [Pod- & Webcasts](types/podcast.md)
- [Blogs & Articles](types/blog.md)
- [Lectures and Trainings](types/lecture.md)
- [Summits & Open Source Events](types/summit.md)
- [Google Summer of Code](types/gsoc.md)
- [Conference and Meetup Appearances](types/conference.md)
- [Awards](types/award.md)
- [Usage in Tools & Products](types/tools.md)

## Verification Expectations

- **Formatting Verification**: Manually verify markdown syntax, URL links, author credits, and icon formatting against existing entries in the target section.
- **TOC Consistency**: Check that the Table of Contents matches all section headings and year entries in `REFERENCES.md`.
- **Validation Commands**: Do not run `npm run lint`, `npm test`, or build commands when modifying only `REFERENCES.md` (and/or `SOLUTIONS.md`).
