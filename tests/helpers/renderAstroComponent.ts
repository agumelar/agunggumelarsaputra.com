import { readFile } from 'node:fs/promises';

import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

interface RenderAstroComponentResult {
  html: string;
  source: string;
}

function replaceExactlyOnce(source: string, search: string, replacement: string, label: string): string {
  const firstIndex = source.indexOf(search);
  const secondIndex = firstIndex === -1 ? -1 : source.indexOf(search, firstIndex + search.length);
  if (firstIndex === -1 || secondIndex !== -1) {
    throw new Error(`Expected exactly one ${label} compiler marker.`);
  }

  return `${source.slice(0, firstIndex)}${replacement}${source.slice(firstIndex + search.length)}`;
}

export async function renderAstroComponent(
  componentUrl: URL,
  props: Record<string, unknown>,
): Promise<RenderAstroComponentResult> {
  const source = await readFile(componentUrl, 'utf8');
  const compilerRuntimeUrl = import.meta.resolve('astro/compiler-runtime');
  let code = transform(source, {
    filename: componentUrl.pathname,
    internalURL: compilerRuntimeUrl,
    sourcemap: 'both',
  }).code;

  const compilerRuntime = await import(compilerRuntimeUrl);
  if (!('createMetadata' in compilerRuntime)) {
    code = replaceExactlyOnce(
      code,
      ', createMetadata as $$createMetadata',
      '',
      'createMetadata import',
    );
    const runtimeImports = code
      .split(/\r?\n/)
      .filter((line) => line.startsWith('import {') && line.endsWith(` from "${compilerRuntimeUrl}";`));
    if (runtimeImports.length !== 1) {
      throw new Error('Expected exactly one Astro compiler runtime import.');
    }
    const [runtimeImport] = runtimeImports;
    code = replaceExactlyOnce(
      code,
      runtimeImport,
      `${runtimeImport}\nconst $$createMetadata = (_filename, metadata) => metadata;`,
      'Astro compiler runtime import',
    );
  }

  code = code.replace(/^import ".*\?astro&type=style.*";\r?\n/gm, '');
  if (/\?astro&type=style/.test(code)) {
    throw new Error('Expected all generated Astro style imports to be removed.');
  }
  code = code.replace(/from "(\.\.?\/[^\"]+)"/g, (_match, specifier: string) => (
    `from "${new URL(specifier, componentUrl).href}"`
  ));
  if (/from "\.\.?\//.test(code)) {
    throw new Error('Expected all generated relative imports to be resolved.');
  }

  const componentModule = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const container = await AstroContainer.create();
  const html = await container.renderToString(componentModule.default, { props });

  return { html, source };
}
