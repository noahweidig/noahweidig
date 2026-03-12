
## 2024-05-23 - Fitts's Law in Markdown
**Learning:** In text-heavy environments like a GitHub README, small link targets (like a bare URL at the end of a sentence) can be hard to tap on mobile devices. Non-clickable context around links is often a missed opportunity for a larger hit area.
**Action:** When adding call-to-action links with leading text (e.g., "Check out my work -> link.com"), wrap the entire phrase in the link to maximize the clickable area, applying Fitts's Law even to simple text interfaces.

## 2024-05-24 - Maximizing Clickable Hit Areas for UI Elements in Markdown
**Learning:** In GitHub Flavored Markdown, using `<kbd>` tags for visual styling creates a button-like boundary, but if the `<kbd>` tag is on the outside of a link (`<kbd>[Text](url)</kbd>`), only the text inside acts as the clickable hit target, ignoring the padding of the `<kbd>` container.
**Action:** Always place `<kbd>` styling tags *inside* Markdown links (`[<kbd>Text</kbd>](url)`). This ensures the entire visual area, including padding, is clickable, significantly improving the interactive footprint for both mobile taps and mouse clicks without any custom CSS.
