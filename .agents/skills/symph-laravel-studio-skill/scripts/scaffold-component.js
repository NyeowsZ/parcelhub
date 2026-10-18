#!/usr/bin/env node

/**
 * scaffold-component.js
 * Non-interactive CLI helper to extract and instantiate canonical component recipes
 * from static references, eliminating agent hallucination.
 */

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

function showHelp() {
  console.log(`
Usage: node scaffold-component.js [options]

Options:
  --type <name>       Component recipe name (e.g., card, button, navbar, modal, table, input)
  --variant <name>    Specific variant (e.g., primary, secondary, metric, action)
  --target <path>     Optional output file to append or write the snippet to
  --list              List all available component recipes and variants
  --help              Show this help message
`);
}

function getReferencesDir() {
  return path.resolve(__dirname, '../references');
}

function parseRecipes() {
  const refDir = getReferencesDir();
  const files = [
    { type: 'button', file: 'buttons-inputs.md', defaultVariant: 'primary' },
    { type: 'input', file: 'buttons-inputs.md', defaultVariant: 'standard' },
    { type: 'card', file: 'cards.md', defaultVariant: 'metric' },
    { type: 'navbar', file: 'navbar.md', defaultVariant: 'header' },
    { type: 'layout', file: 'layouts-tables.md', defaultVariant: 'shell' },
    { type: 'table', file: 'layouts-tables.md', defaultVariant: 'responsive' },
    { type: 'modal', file: 'feedback-dialogs.md', defaultVariant: 'dialog' },
    { type: 'alert', file: 'feedback-dialogs.md', defaultVariant: 'success' },
    { type: 'typography', file: 'typography.md', defaultVariant: 'hero' }
  ];

  const catalog = {};

  for (const item of files) {
    const fullPath = path.join(refDir, item.file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const sections = content.split(/^###? /m);

    catalog[item.type] = {
      sourceFile: item.file,
      variants: {}
    };

    for (const sec of sections) {
      const lines = sec.trim().split('\n');
      const title = lines[0].toLowerCase();
      const codeMatch = sec.match(/```html\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        let key = title.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (key.includes('primary')) key = 'primary';
        else if (key.includes('secondary') || key.includes('outline')) key = 'secondary';
        else if (key.includes('glass')) key = 'glass';
        else if (key.includes('arrow') || key.includes('wavy')) key = 'arrow-link';
        else if (key.includes('filter') || key.includes('radio')) key = 'filter-pill';
        else if (key.includes('offering') || key.includes('capability')) key = 'offering';
        else if (key.includes('case-study') || key.includes('work') || key.includes('editorial-work')) key = 'case-study';
        else if (key.includes('metric') || key.includes('kpi')) key = 'metric';
        else if (key.includes('hero-headline') || (key.includes('headline') && key.includes('accent'))) key = 'headline';
        else if (key.includes('hero') || key.includes('cinematic')) key = 'hero';
        else if (key.includes('trust') || key.includes('partner') || key.includes('marquee')) key = 'trust-bar';
        else if (key.includes('table') || key.includes('sla')) key = 'sla-table';
        else if (key.includes('testimonial')) key = 'testimonial';
        else if (key.includes('consultation') || key.includes('dialog') || key.includes('modal')) key = 'consultation';
        else if (key.includes('cookie') || key.includes('notice')) key = 'cookie-banner';
        else if (key.includes('textarea')) key = 'textarea';
        else if (key.includes('select')) key = 'select';
        else if (key.includes('underline-text') || key.includes('text-input')) key = 'text-input';
        else if (key.includes('eyebrow')) key = 'eyebrow';
        else if (key.includes('header')) key = 'header';

        catalog[item.type].variants[key] = codeMatch[1].trim();
      }
    }
  }

  return catalog;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const catalog = parseRecipes();

  if (args.includes('--list')) {
    console.log('Available Component Recipes:\n');
    for (const [type, data] of Object.entries(catalog)) {
      const variants = Object.keys(data.variants).join(', ');
      console.log(`  - ${type.padEnd(12)} (variants: ${variants || 'default'}) [${data.sourceFile}]`);
    }
    process.exit(0);
  }

  const typeIdx = args.indexOf('--type');
  if (typeIdx === -1) {
    console.error('Error: Missing required argument --type <name>. Use --list to see options.');
    process.exit(1);
  }

  const reqType = args[typeIdx + 1];
  const variantIdx = args.indexOf('--variant');
  const reqVariant = variantIdx !== -1 ? args[variantIdx + 1] : null;
  const targetIdx = args.indexOf('--target');
  const targetPath = targetIdx !== -1 ? args[targetIdx + 1] : null;

  if (!catalog[reqType]) {
    console.error(`Error: Unknown component type "${reqType}". Available: ${Object.keys(catalog).join(', ')}`);
    process.exit(1);
  }

  const variants = catalog[reqType].variants;
  let selectedSnippet = null;

  if (reqVariant && variants[reqVariant]) {
    selectedSnippet = variants[reqVariant];
  } else if (Object.keys(variants).length > 0) {
    selectedSnippet = variants[Object.keys(variants)[0]];
  }

  if (!selectedSnippet) {
    console.error(`Error: No snippet found for component "${reqType}" with variant "${reqVariant || 'default'}".`);
    process.exit(1);
  }

  if (targetPath) {
    fs.writeFileSync(path.resolve(targetPath), selectedSnippet + '\n', 'utf8');
    console.log(`Successfully generated ${reqType} (${reqVariant || 'default'}) into: ${targetPath}`);
  } else {
    console.log(selectedSnippet);
  }
}

main();
