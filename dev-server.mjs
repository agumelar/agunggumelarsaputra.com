import { dev } from 'astro';

async function start() {
  try {
    console.log('Starting Astro Dev Server programmatically...');
    const server = await dev({
      root: process.cwd(),
    });
    console.log('Astro dev server started on http://localhost:4321');
  } catch (err) {
    console.error('Failed to start Astro dev server:', err);
  }
}

start();
