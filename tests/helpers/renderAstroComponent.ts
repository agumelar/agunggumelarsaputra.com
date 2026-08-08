import { readFile } from 'node:fs/promises';

import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

interface RenderAstroComponentResult {
  html: string;
  source: string;
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
    code = code.replace(', createMetadata as $$createMetadata', '');
    code = code.replace(
      /^(import \{[^\n]+\} from "[^"]+";)$/m,
      (runtimeImport) => `${runtimeImport}\nconst $$createMetadata = (_filename, metadata) => metadata;`,
    );
  }

  code = code.replace(/^import ".*\?astro&type=style.*";\r?\n/gm, '');
  code = code.replace(/from "(\.\.?\/[^\"]+)"/g, (_match, specifier: string) => (
    `from "${new URL(specifier, componentUrl).href}"`
  ));

  const componentModule = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const container = await AstroContainer.create();
  const html = await container.renderToString(componentModule.default, { props });

  return { html, source };
}
