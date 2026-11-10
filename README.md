# Homely Candid Posebook — Vercel package

1,000 code-drawn 2.5D pose configurations with 5 viewpoints each (5,000 views).

- Area browsing: Living Room, Bedroom, Kitchen, On Bed, On Sofa, On Floor, By Window, Balcony and Hallway.
- 212 on-bed and 187 on-sofa poses; 62 optional POV contact references.
- P501–P1000 contain no touching.
- 1200 × 1600 PNG generation, download and image dragging.
- Head-to-thigh framing, camera guides and 24 poses per page.
- Original separate 3D rig editor included; expanded gallery poses are not individually connected to that editor.

Read DEPLOY-VERCEL.md for deployment steps. The archive root is the project root. No dependencies, API keys or production build step are required for the gallery.

All active gallery illustrations are generated from the included JavaScript. Older pre-rendered images, unused gallery versions and development screenshots are not needed by this version and are not bundled. The 3D editor retains its pinned Three.js CDN dependency.

Local preview: with Node.js installed, run node serve.cjs in this folder and open http://127.0.0.1:8766/gallery.html.
