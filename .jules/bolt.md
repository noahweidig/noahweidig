## 2024-03-20 - SVG Optimization Limitations
**Learning:** Optimizing SVGs using `svgo` with default settings on GitHub badges can break embedded base64 images and critical path animations. Custom configuration is required to preserve functionality while still stripping unnecessary metadata.
**Action:** Always configure `svgo` to retain unknown elements, hidden elements, useless definitions, and original IDs when optimizing SVGs that contain embedded images or complex `<animate>` tags.

## 2024-03-22 - Nested Base64 PNGs in SVGs
**Learning:** Embedding base64-encoded PNG raster images inside SVGs (`<image href="data:image/png;base64,...">`) bloats file size, prevents vector scaling benefits, and bypasses SVG optimization tools.
**Action:** Decode the base64 data and replace the `<image>` tag with a native inline nested `<svg>` tag, preserving the `x`, `y`, `width`, and `height` attributes for layout.
