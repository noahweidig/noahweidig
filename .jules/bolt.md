## 2024-03-20 - SVG Optimization Limitations
**Learning:** Optimizing SVGs using `svgo` with default settings on GitHub badges can break embedded base64 images and critical path animations. Custom configuration is required to preserve functionality while still stripping unnecessary metadata.
**Action:** Always configure `svgo` to retain unknown elements, hidden elements, useless definitions, and original IDs when optimizing SVGs that contain embedded images or complex `<animate>` tags.
