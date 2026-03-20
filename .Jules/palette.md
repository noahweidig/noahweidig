## 2024-03-20 - Markdown Aria-Hidden Limitation
**Learning:** GitHub's markdown parser sanitizes `aria-hidden` attributes on inline HTML elements, making it ineffective for hiding decorative text or emojis. However, for structural banner/footer images like `<img>`, empty `alt=""` is standard for decorative images, but when it's just an `<img>` tag without a link, it's decorative anyway.
**Action:** Use standard empty `alt=""` for decorative images instead of relying solely on `aria-hidden` which may be stripped.
