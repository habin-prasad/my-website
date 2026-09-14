---
title: "Cross-Browser Visual Regression Suite & Subpixel Masking Engine"
role: "Senior Automation Engineer"
period: "Year 2 · Q5 (Previous SaaS)"
summary: "Designed a cross-browser visual regression testing pipeline that captures, masks, and compares 3,000+ UI component states across WebKit, Gecko, and Blink rendering engines."
domain: "Quality & Automation"
metrics:
  - "3,000+ UI Components Verified per Build"
  - "95% Reduction in False-Positive Visual Alerts"
  - "Sub-2-Minute Snapshot Comparison Pipeline"
technologies:
  - "Node.js"
  - "Resemble.js"
  - "Selenium Grid"
  - "AWS S3"
  - "Docker"
  - "Canvas API"
featured: false
---

### Situation
Rapid frontend deployment cycles frequently introduced subtle CSS layout bugs, element overlaps, and font rendering shifts across non-Chrome browsers. Manual visual inspection across multiple viewports and browsers took hours and consistently missed regressions in deep navigation flows.

### Task
Architect an automated visual regression testing engine that captures baseline UI screenshots, handles anti-aliasing variations across OS platforms, and flags true structural UI defects without halting pipelines on benign 1-pixel shifts.

### Action
* **Perceptual Image Comparison Pipeline**: Built a Node.js microservice using `Resemble.js` and the Canvas API that parallelized snapshot comparisons against baseline images stored in AWS S3.
* **Dynamic Content Masking**: Created an automated pre-render script that injected custom CSS rules (`visibility: hidden !important`) to obscure dynamic DOM elements (e.g., timestamps, avatars, dynamic ads) prior to snapshot capture.
* **Color Delta Thresholding**: Implemented an automated tolerance algorithm utilizing CIELAB color-space distance ($\Delta E$) to filter out subpixel font anti-aliasing differences between Linux CI runners and Windows/macOS rendering engines.

### Result
* Reduced visual testing false-positive rates from **42% down to under 2%**.
* Automated visual layout verification across **3,000+ UI components**, completing comparisons in under 2 minutes.