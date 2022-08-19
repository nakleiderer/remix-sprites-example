# remix-sprites-example

A script that combines a folder of `.svg` files into a single `sprites.svg` file and type definitions for safe usage.

## Technical Overview

### Compilation Script

Source: `scripts/sprites.ts`

Here's the basic overview of the compilation script.

1. Scan the input folder for `.svg` files.
2. For Each `.svg`:
   1. Generate an `id` based on the path
   2. Parse the file contents in a virtual DOM
   3. Replace the `<svg>` element in the file with a `<symbol>` element, copying attributes and children.
   4. Add the generated `id` to the new `symbol` element.
3. Wrap each new `<symbol>` element in a parent `<svg>` and output the `outerHTML` to the configured path.
4. Generate the TypeScript types and output to the configured path.

### Sprite Component

Source: `app/Sprite.tsx`

This is a relatively boring React component that just spits out HTML like the following:

```html
<svg>
  <use href="sprites.svg#outline:academic-cap"></use>
</svg>
```

This component is not involved with the compilation process. However, this component is enhanced by the types generated from the script.

```tsx
import type { SpriteProps } from "~/SpriteProps";
```

### Preloading the Sprites

Source: `app/root.tsx`

If the loading speed of the sprites is important to you, export a preload link using Remix's Links function. This hints to the browser that the file needs to be loaded soon.

```ts
import type { LinksFunction } from "@remix-run/node";
import spriteSrc from "~/sprites.svg";

export const links: LinksFunction = () => {
  return [
    {
      rel: "preload",
      href: spriteSrc,
      as: "image",
    },
  ];
};
```

### Example

**Input Files**

```
sprites
├── outline
│   ├── academic-cap.svg
│   ├── adjustments.svg
│   ├── annotation.svg
│   └── archive.svg
└── solid
    ├── academic-cap.svg
    ├── adjustments.svg
    ├── annotation.svg
    └── archive.svg
```

**Sprites Output** (truncated for clarity)

```html
<svg>
  <symbol id="outline:academic-cap">...</symbol>
  <symbol id="outline:adjustments">...</symbol>
  <symbol id="outline:annotation">...</symbol>
  <symbol id="outline:archive">...</symbol>
  <symbol id="solid:academic-cap">...</symbol>
  <symbol id="solid:adjustments">...</symbol>
  <symbol id="solid:annotation">...</symbol>
  <symbol id="solid:archive">...</symbol>
</svg>
```

**TypeScript Output**

```ts
export const spriteNames = [
  "outline:academic-cap",
  "outline:adjustments",
  "outline:annotation",
  "outline:archive",
  "solid:academic-cap",
  "solid:adjustments",
  "solid:annotation",
  "solid:archive",
] as const;
type SpriteName = typeof spriteNames[number];
export type SpriteProps = {
  name: SpriteName;
} & JSX.IntrinsicElements["svg"];
```

**Usage**

```tsx
import Sprite from "~/Sprite";

export default function Example() {
  return (
    <Sprite name="outline:academic-cap" className="w-5 h-5 text-blue-500" />
  );
}
```

## Running the Demo

1. Clone this repository.
1. Compile the sprites by running `npm run build:sprites`
1. Run `npm run dev` from your terminal.
1. Open your browser to `http://localhost:3000` and view the index

## Potential Improvements

- Automatically regenerate the sprite when the input folder changes for a better development experience.
- Gracefully handle parsing errors if the input folder contains a malformed SVG.
- Test with a wider variety of SVGs to ensure it actually works well 😅

## Acknowledgements

- Ryan Florence sparked this idea in response to a Discord message about the best way to handle icons.
- Icons within the sprites folder were downloaded from the [heroicons repository](https://github.com/tailwindlabs/heroicons) under the MIT License and are Copyright (c) 2020 Refactoring UI Inc.
