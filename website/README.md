# Year Dots - Website

This is the landing page for the Year Dots Android app. It's a simple React site that demos the live wallpaper's features and provides the APK download.

## Built With
- **Vite + React** for the framework
- **Vanilla CSS** for almost all styling (no Tailwind/Bootstrap, just custom CSS variables)
- **Framer Motion** for some scroll animations

## Setup
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## Updating the APK
The `year_dots.apk` file is hosted directly in `public/`.
To update the downloadable version:
1. Build the release APK from the Android project.
2. Rename it to `year_dots.apk`.
3. Drop it into `public/`, overwriting the old one.
4. Run `npm run build` and deploy.

## Structure
- `src/components/Hero.jsx`: Main component. Contains the phone simulator and all the interactive controls (color, grid, font selectors).
- `src/App.css`: Global styles, reset, and font imports.
- `src/index.css`: Specific styles for the Hero section, background effects, and the phone UI.

## Deployment
Build the project:
```bash
npm run build
```
This outputs to `dist/`. You can drop that folder onto Netlify/Vercel or host it anywhere static.
