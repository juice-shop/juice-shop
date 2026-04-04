# Skill: Adding a new Reference to REFERENCES.md

This skill provides instructions for Junie to analyze a new reference (blog post, podcast, conference talk, etc.), determine its type, collect missing information, and add it to the correct section of `REFERENCES.md` following the existing format.

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

## Common Formatting Rules

- Use `*` for list items.
- Links are in `[Title](URL)` format.
- Mention authors/speakers with "by [Name](Link)" or "with [Name](Link)".
- Use existing icons (:bulb:, :godmode:, :mega:, :dollar:) where appropriate.
- For non-English content, add the language code in parentheses, e.g., `(:de:)`, `(:es:)`.
