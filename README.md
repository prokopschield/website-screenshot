# @prokopschield/website-screenshot

## Installation

```
$ yarn add @prokopschield/website-screenshot
```

## Usage

```typescript
import { screenshot } from '@prokopschield/website-screenshot';

const preview = await screenshot(
    'url',
    [
        // requested resolutions
        // e.g. { x: 1920, y: 1080 }
    ],
    {
        // options
        // imgFormat: 'jpeg' | 'png' | 'webp'
        // imgQuality: number between 0 and 100 (jpeg/webp)
    }
);

preview.error; // Error | undefined
preview.screenshots; // Map<resolution, Buffer>
preview.screenshots.get('1920x1080'); // screenshot of resolution 1920x1080 if requested, or undefiend
preview.URLs; // set of URLs that were accessed
preview.load_time_ms; // how long the page took to load
preview.size; // how many bytes were actually fetched
preview.html; // page's html after rendering
preview.resources; // Map<URL, Buffer>
```

## Installation (for cli usage)

**Please note you must be root (Unix/GNU) or administrator (Windows)**

```
# yarn global add @prokopschield/website-screenshot
# npm i -g @prokopschield/website-screenshot
```

## Usage (cli)

```
$ website-screenshot PAGE [[-r] resolution] [[-f] format] [[-q] quality] >FILENAME
```
