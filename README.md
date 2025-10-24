# Kitty Reader

An interactive application to help young children learn to read by breaking down text into syllables and guiding them with a friendly kitty character.

This project was bootstrapped with Vite and uses React, TypeScript, and Tailwind CSS.

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or newer recommended)
- npm (comes with Node.js)

### Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory in your terminal.
3.  Install the required dependencies:
    ```bash
    npm install
    ```

## Available Scripts

### `npm run dev`

Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `dist/` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include hashes. Your app is ready to be deployed!

## Deployment

This project is configured to be deployed to a subdirectory named `/kitty-reader/`. This is set in the `vite.config.ts` file.

If you are deploying to a different path (e.g., the root of a domain or a different repository name), you should update the `base` property in `vite.config.ts`:

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/', // For root deployment
  // or
  base: '/your-new-repo-name/', // For deployment to a different subdirectory
})
```

After running `npm run build`, you can deploy the contents of the `dist/` folder to any static hosting service like GitHub Pages, Vercel, or Netlify.