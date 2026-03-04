# Electron Icons

This directory contains app icons for different platforms.

## Required Icons:

### Windows:
- `icon.ico` (256x256 ICO file)

### macOS:
- ` icon.icns` (512x512 ICNS file)

### Linux:
- `icon.png` (512x512 PNG file)
- `16x16.png`
- `32x32.png`
- `48x48.png`
- `64x64.png`
- `128x128.png`
- `256x256.png`
- `512x512.png`

### Tray Icon:
- `tray.png` (16x16 or 32x32 PNG for system tray)

## Generating Icons:

You can generate these from a single high-res image (1024x1024) using:

**Online tools:**
- https://icon.kitchen/
- https://icoconvert.com/

**CLI tools:**
```bash
# Install electron-icon-builder
npm install -g electron-icon-builder

# Generate all icons from a single image
electron-icon-builder --input=icon.png --output=electron/icons
```

## Current Status:

⚠️ **PLACEHOLDER** - Replace with actual DigiDhoodh logo (milk drop + saffron/green colors)

For now, the build will use default Electron icon. Create proper icons before production release.
