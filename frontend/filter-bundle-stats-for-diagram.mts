// Filters font and SVG assets from the esbuild stats.json to produce a cleaner bundle diagram.
// Called by the "bundle-visualizer" npm script before running esbuild-visualizer.

import { readFile, writeFile } from 'fs/promises'

const statsPath = './dist/frontend/stats.json'
const outputPath = './dist/frontend/stats-filtered.json'

const stats = JSON.parse(await readFile(statsPath, 'utf-8'))

const excludePattern = /\.(woff2?|ttf|eot|otf|svg)(#.*)?$/i

for (const key of Object.keys(stats.inputs)) {
  if (excludePattern.test(key)) {
    delete stats.inputs[key]
  }
}

for (const output of Object.values(stats.outputs) as any[]) {
  if (output.inputs) {
    for (const key of Object.keys(output.inputs)) {
      if (excludePattern.test(key)) {
        delete output.inputs[key]
      }
    }
  }
}

await writeFile(outputPath, JSON.stringify(stats))
