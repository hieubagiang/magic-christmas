# Magic Christmas - AI Copilot Instructions

## Project Overview

**Magic Christmas** is an interactive WebGL-based 3D Christmas experience with hand gesture detection, particle animations, and photo gallery features. Users interact with the scene via hand tracking using MediaPipe, uploading personal photos and music to create a customized festive display.

### Core Technologies
- **Three.js** - 3D rendering (particles, meshes, textures, cameras)
- **MediaPipe Hands** - Real-time hand gesture detection via webcam
- **Firebase** - Backend for potential future database/authentication (configured but currently not core to logic)
- **Vanilla JavaScript** - Single-file HTML implementation (`index.html` - 834 lines)

---

## Architecture & Key Components

### 1. **State Machine (Hand Gesture Detection)**
The application operates as a 4-state system controlled by hand gestures detected via MediaPipe:
- **TREE** - Christmas tree display (default, fist gesture: fingers close to wrist, `avgDist < 0.22`)
- **EXPLODE** - Particles burst outward (open hand: fingers spread, `pinchDist >= 0.05`)
- **HEART** - Particles form heart shape (two hands forming heart, `distIndex < 0.12 && distThumb < 0.12`)
- **PHOTO** - Zoom in on selected photo (pinch gesture: thumb+index touching, `pinchDist < 0.05`)

**Key insight:** Hand detection runs continuously via `initHandTracking()`. State transitions trigger automatic particle system updates in the animation loop (`updateParticleGroup()`).

### 2. **Particle Systems** (Three.js Points geometry)
Three independent particle groups render different elements with shared animation logic:

| Group | Count | Size | Color | Blending | Target States |
|-------|-------|------|-------|----------|----------------|
| **Gold** | 2000 | 2.0px | `0xFFD700` | Additive | Tree (orbits), Explode, Heart |
| **Red** | 300 | 3.5px | `0xFF0000` | Additive | Tree (orbits), Explode, Heart |
| **Gift** | 150 | 3.0px | `0xFFFFFF` | Normal | Explode, Heart |

Each particle stores 3 target position arrays:
- **Tree targets** - Conical Christmas tree shape (height-based radius: `maxR = (1 - h/treeHeight) * treeBaseRadius`)
- **Explode targets** - Spherical distribution (normalized cube root sampling for uniform sphere)
- **Heart targets** - Parametric heart curve with radial fill and noise: `hx = 16*sin³(t)`, `hy = 13*cos(t) - 5*cos(2t)...`

**Animation:** `updateParticleGroup()` uses linear interpolation: `position += (target - position) * speed`

### 3. **Photo Gallery System**
- Photos uploaded via HTML file input are converted to data URLs and stored in `uploadedPhotos[]` array
- Each photo creates a THREE.Mesh (plane geometry 8x8) with golden border (9x9 plane at z=-0.1)
- In PHOTO state: photos orbit around camera, selected photo zooms to center with dynamic scaling based on depth
- **Auto-persistence:** Photos saved to localStorage under key `'christmasConfig'` (includes youtubeLink timestamp)

### 4. **Audio Integration**
- YouTube music embedded via iframe (`updateMusic()` extracts video ID from URL)
- Supports multiple URL patterns: `youtube.com/watch?v=`, `youtu.be/`, direct video IDs
- Video ID regex: `/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/`

---

## Developer Workflows

### Local Testing
1. Open `index.html` directly in a modern browser (Chrome/Firefox/Edge required for MediaPipe & WebGL)
2. Allow camera permission when prompted
3. Click **⚙️ Settings** to upload photos (JPG/PNG) and paste YouTube link

### Configuration Changes
- **Particle counts/sizes:** Modify `CONFIG` object (line ~385)
- **Tree shape:** Adjust `treeHeight`, `treeBaseRadius`, `explodeRadius`
- **Colors:** Textures generated via `createCustomTexture()` (line ~350); modify gradient stops or hex colors
- **Hand gesture thresholds:** Edit distance/position checks in `hands.onResults()` callback (line ~760)

### Performance Considerations
- **Particle rendering:** Uses WebGL additive/normal blending; 2000+ particles on mid-range devices may impact FPS
- **Texture creation:** Canvas-based textures (title text, star, love text) regenerated on init; cache if repeated
- **Camera constraints:** 320×240 MediaPipe input downsampled from device camera for speed

---

## Project-Specific Patterns

### Custom Texture Generation
Rather than loading external image files, textures are created procedurally via canvas 2D context:
```javascript
// Example: gold glow with radial gradient
const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
grd.addColorStop(0, '#FFFFFF');    // Core
grd.addColorStop(0.5, '#FFD700');  // Middle
grd.addColorStop(1, 'rgba(0,0,0,0)'); // Fade
```

### Geometry Data Structures
Particle positions stored as flat Float32Arrays (3 values per vertex for x, y, z):
- Accessed via `positions[i*3]`, `positions[i*3+1]`, `positions[i*3+2]`
- Target positions pre-calculated at init and stored in `group.geometry.userData` for reuse
- After modification, signal Three.js with `geometry.attributes.position.needsUpdate = true`

### Animation Loop Synchronization
The `animate()` function runs continuously (requestAnimationFrame):
1. Reads current `state` variable (set by hand detection)
2. Updates all three particle groups with `updateParticleGroup(state, speed)`
3. Updates photo orbits and decorations based on `state`
4. Renders scene with camera

**Critical:** State changes are asynchronous (hand detection), so animations must handle mid-flight transitions smoothly.

---

## Key Files & References

- [index.html](index.html) - Complete application (HTML/CSS/JavaScript)
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Configuration for optional cloud backend
- [images/](images/) - User-uploaded or pre-placed media assets
- [audio/](audio/) - Not actively used; YouTube streaming is primary audio source

---

## Common Tasks

### Adding a New Particle Gesture State
1. Create new target position array in `createParticleSystem()` and add to `userData`
2. Add `else if` branch in `updateParticleGroup()` to handle animation logic
3. Add gesture detection condition in `hands.onResults()` callback and set `state = 'NEW_STATE'`
4. Update state machine documentation above

### Adjusting Visual Effects
- **Brightness pulsing:** Modify `brightness = baseColor * sin(time * freq + phase)` expressions
- **Rotation speed:** Change increment in `group.rotation.y += value` (e.g., 0.003 for TREE)
- **Particle scaling:** Update `beatScale` calculation for HEART state

### Testing Hand Gestures Offline
- Add debug logging in `hands.onResults()` to print hand distances and positions
- Use browser DevTools console to manually set `state` variable for quick testing
- Adjust `minDetectionConfidence` / `minTrackingConfidence` if hand tracking jitters

---

## Integration Points

- **Firebase:** Project configured (see FIREBASE_SETUP.md) but not integrated into main logic; Firestore indexes defined but unused
- **MediaPipe CDN:** Script loaded from jsDelivr; if unavailable, hand tracking fails silently
- **Three.js CDN:** Core rendering dependency; version r128

**Note:** This is a client-side only application with optional cloud backend setup—no build step required.
