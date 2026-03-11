## 2026-03-11 - [Improved Alt Text for Profile Headers and Footers]
**Learning:** Generic alt text like "header" or "footer" for generated images (e.g. via capsule-render) does not provide adequate context for screen readers. Header images often contain meaningful text or information about the person, while footer images are often purely decorative.
**Action:** Replace generic alt text on meaningful header images with the actual content/context of the image (e.g., "Name - Titles"). Use empty alt text (`![]`) for purely decorative images like a standard footer graphic so screen readers can safely skip over them.
## 2026-03-11 - [Accessible Alt Text for Two-Sided Badges]
**Learning:** Screen readers announce the `alt` text of images. For two-sided status badges (like shields.io) often used for links, generic `alt` text like `![Email]` causes screen readers to miss the right side of the badge (e.g., the actual email address or username).
**Action:** Always write alt text for two-sided badges that describes the full visual text or intent, e.g., `![Email: noah@noahweidig.com]` or `![LinkedIn Connect]` instead of just the label.
