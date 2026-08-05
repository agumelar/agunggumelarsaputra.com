# Task 6 Report: Connect Lesson Completion to API

## Objective
Connect lesson completion in `src/pages/pembelajaran/[...slug].astro` to the `/api/progress/complete-lesson` API.

## Implementation Details
- Updated the client script in `src/pages/pembelajaran/[...slug].astro` to include an async click handler on the completion button.
- The handler now calls `/api/progress/complete-lesson` using `fetch` with a `POST` request.
- Based on the response, the button text is updated dynamically (e.g. showing actual `xpEarned`).
- Graceful error handling defaults back to a standard success text if the fetch fails.

## Status
DONE
