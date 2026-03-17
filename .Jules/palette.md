## 2024-05-24 - Banner Image Accessibility
**Learning:** In Markdown, banner or structural images wrapped in hyperlinks must have descriptive alt text. Without it, screen readers will announce the raw destination URL or treat it as an empty link, obscuring the primary navigation path.
**Action:** Always ensure images wrapped in anchor tags have descriptive `alt` text to provide context for screen readers.

## 2024-05-25 - Native Hover Tooltips for CTAs
**Learning:** In GitHub Markdown, adding a `title` attribute to `<a>` tags or using the native title syntax (`[Text](url "Tooltip Title")`) provides native hover tooltips. This is critical for improving accessibility, predictability, and user context without relying on custom CSS or JavaScript, particularly for primary Call-to-Action links and banner images.
**Action:** Always include descriptive tooltips using the native markdown syntax (`title` attr or `"Tooltip Title"`) for main navigation links and primary interactive elements in Markdown profiles.

## 2024-05-26 - Semantic HTML over Visual Faux Headings
**Learning:** Using bold text (`**Text**`) for visual separation creates a faux heading that screen readers cannot identify. True semantic headings (e.g., `#### Text`) provide navigational structure and context for assistive technologies.
**Action:** Always use proper markdown heading syntax instead of bold text for document structure and section titles.
