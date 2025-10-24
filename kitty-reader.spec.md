# Kitty Reader: Application Specification

## 1. Overview

**Kitty Reader** is a single-page web application designed to assist young children in learning to read. It takes a block of user-provided text and transforms it into an interactive reading experience. The core concept is to break down words into syllables and guide the child's focus from one syllable to the next using a playful animated character (a kitty emoji).

The application is built to be a standalone, client-side tool with no backend or external API dependencies, ensuring fast performance, offline usability, and zero cost.

## 2. Functional Requirements

### 2.1. Setup Screen

-   **Purpose**: To allow a user (e.g., a parent) to input the text for the reading session.
-   **Components**:
    -   **Title & Icon**: The screen displays the application title "Kitty Reader" and a distinct cat icon for branding.
    -   **Text Input Area**: A large `textarea` element is provided for pasting or typing text. It should come pre-populated with a friendly, default example text in Russian.
    -   **Start Button**: A prominent button labeled "Start Reading" initiates the reading session.
        -   The button is disabled if the text area is empty or contains only whitespace.
        -   While the text is being processed, the button shows a loading spinner and is disabled.
    -   **Error Display**: An area to display user-friendly error messages if text processing fails.

### 2.2. Reading Screen

-   **Purpose**: To display the processed text in an interactive, scrollable format.
-   **Text Presentation**:
    -   The text is converted to **uppercase**.
    -   Each word is split into syllables, visually separated by hyphens (e.g., "HELLO" becomes "HEL-LO"). Punctuation is preserved and attached to the final syllable of a word (e.g., "WORLD!" becomes "WORLD!").
    -   The font size for the text is very large (e.g., `text-8xl`) to ensure readability for young children.
-   **Layout & Scrolling**:
    -   The words are laid out horizontally in a single line.
    -   The view is a horizontally scrollable container that hides the browser's scrollbar.
    -   The word currently being read (the "active word") is automatically scrolled to the center of the viewport.
    -   The active word is visually highlighted with a distinct background color (e.g., `bg-amber-200/80`).
-   **Kitty Navigator**:
    -   A kitty emoji (`🐱`) serves as the reading guide.
    -   The kitty is positioned directly above the current syllable being read.
-   **Interaction & Navigation**:
    -   **Keyboard Controls**: The primary navigation is via the keyboard's arrow keys.
        -   **Right Arrow (`→`)**: Moves the kitty to the next syllable.
            -   If the next syllable is in the same word, the kitty jumps to it.
            -   If the next syllable is in the next word, the word highlight and scroll position update to the new word, and the kitty jumps to the first syllable of that new word.
        -   **Left Arrow (`←`)**: Moves the kitty to the previous syllable.
            -   If the previous syllable is in the same word, the kitty jumps to it.
            -   If the previous syllable is at the start of the current word, the word highlight and scroll position update to the previous word, and the kitty jumps to the last syllable of that previous word.
    -   **Kitty Animation**: When moving between syllables, the kitty performs a smooth, curved "jump" animation. The height and trajectory of the jump are calculated to feel natural. The animation is handled using the Web Animations API for performance.
-   **Controls**:
    -   **Back Button**: A clearly visible "Back" button (using an arrow icon) is present in the top-left corner, allowing the user to return to the Setup Screen. This preserves the last entered text.
    -   **Instructional Text**: A small, non-intrusive text element at the bottom of the screen reminds the user to use the arrow keys.

## 3. Technical Specification

### 3.1. Technology Stack

-   **Framework**: React 18
-   **Language**: TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS for utility-first styling.
-   **Code Quality**: Standard ESLint and Prettier rules enforced by the TypeScript compiler settings.

### 3.2. Project Structure

The project follows a standard Vite/React structure, with all source code residing in the `src/` directory.

```
/
├── dist/                  # Build output directory
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── icons/         # SVG icon components
│   │   ├── ReadingScreen.tsx
│   │   └── SetupScreen.tsx
│   ├── hooks/
│   │   └── useSyllableNavigation.ts # Logic for managing reading state
│   ├── services/
│   │   └── syllabification.ts   # Core text processing logic
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main application component (state management)
│   ├── index.css          # Tailwind CSS entry point
│   └── index.tsx          # React application root
├── .eslintrc.cjs
├── index.html             # HTML entry point for Vite
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.ts
```

### 3.3. Core Logic Implementation

#### 3.3.1. Syllabification Algorithm (`syllabification.ts`)

-   **Functionality**: A client-side, heuristic-based algorithm splits words into syllables. It does **not** rely on any external APIs.
-   **Process**:
    1.  **Capitalization**: The input text is converted to uppercase. A special rule handles the Russian letter 'ё', ensuring it becomes 'Ё' (as `toUpperCase()` handles this incorrectly).
    2.  **Word Parsing**: The text is split into words and whitespace. A regular expression is used to separate words from trailing punctuation. The regex must account for all supported alphabets, including `Ё`.
    3.  **Syllable Splitting (`syllabifyWord`)**:
        -   The algorithm identifies groups of vowels (`[аеёиоуыэюяaeiouyäöü]`).
        -   It splits consonants between vowel groups based on common patterns (e.g., V-CV, VC-CV).
        -   It avoids splitting short words or words with only one vowel group.
-   **Data Structure**: The final output is an array of `Word` objects, where each `Word` contains an array of `Syllable` objects (`ProcessedText`).

#### 3.3.2. State Management (`App.tsx` and `useSyllableNavigation.ts`)

-   **App State**: The main `App.tsx` component manages high-level state:
    -   `appState`: `'setup'` or `'reading'`.
    -   `rawText`: The original text from the textarea.
    -   `processedText`: The structured text object after syllabification.
    -   `isLoading`, `error`: UI state for the setup screen.
-   **Navigation State (`useSyllableNavigation` hook)**: This custom hook encapsulates the logic for the reading screen.
    -   It tracks the `currentPosition` (`{ wordIndex, syllableIndex }`).
    -   It provides memoized values for the `currentWord` and `currentSyllable`.
    -   It exposes stable `nextSyllable` and `prevSyllable` callback functions to advance or retreat the position.

#### 3.3.3. Rendering and Animation (`ReadingScreen.tsx`)

-   **DOM Element References**: `useRef` is used to maintain references to the DOM elements for each word (`wordRefs`) and each syllable (`syllableRefs`), as well as the kitty (`kittyRef`). These are crucial for calculating positions.
-   **Kitty Positioning**: The kitty's `transform: translate(x, y)` style is updated in a `useEffect` hook that tracks `currentSyllable`.
    -   **Critical Detail**: The target position is calculated by summing the `offsetLeft` and `offsetTop` of both the parent word element and the target syllable element relative to their common scrolling container. This ensures accurate positioning within the scrollable view.
-   **Kitty Animation**: The Web Animations API (`element.animate()`) is used to create the jump effect.
    -   The animation uses a keyframe array with three points: start, apex (midpoint), and end.
    -   The start position is retrieved from a ref (`prevPositionRef`) that stores the kitty's last known coordinates.
    -   The animation uses a `cubic-bezier` easing function for a smooth feel and `fill: 'forwards'` to persist the final state.
-   **Z-Index Management**: The kitty element is rendered as the last child within its container and given a higher `z-index` to ensure it always appears on top of the text elements.
-   **Layout Clipping**: The scrolling container has sufficient vertical padding (`py-20`) to prevent the kitty's jump animation from being visually clipped by the container's boundaries.

## 4. Build and Deployment

-   **Build Command**: The project is built using `npm run build`. This command invokes Vite to bundle all assets into a `dist/` directory.
-   **Deployment Target**: The configuration is set up for deployment to a subdirectory on GitHub Pages.
-   **Base Path**: The `vite.config.ts` file has its `base` property set to `'/kitty-reader/'`. This ensures that all asset links in the generated `index.html` are correctly prefixed (e.g., `/kitty-reader/assets/index.js`), allowing the app to load correctly when not at the root of a domain. This is the key configuration for GitHub Pages deployment.
