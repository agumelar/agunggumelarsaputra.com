import { dev } from 'astro';
import fs from 'fs';
import path from 'path';

// Load environment variables for local development
function loadLocalEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        if (typeof process.loadEnvFile === 'function') {
          process.loadEnvFile(fullPath);
        } else {
          // Manual fallback parser if loadEnvFile not available
          const content = fs.readFileSync(fullPath, 'utf-8');
          content.split('\n').forEach((line) => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
              const key = match[1];
              let value = (match[2] || '').trim();
              if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
              if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
              if (!process.env[key]) {
                process.env[key] = value;
              }
            }
          });
        }
        console.log(`Loaded environment variables from ${file}`);
      } catch (err) {
        console.warn(`Could not load ${file}:`, err.message);
      }
    }
  }

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (dbUrl) {
    console.log('✓ Database URL loaded successfully for local development.');
  } else {
    console.warn('⚠️ Warning: POSTGRES_URL not found in local environment files.');
  }
}

async function start() {
  try {
    loadLocalEnv();
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
