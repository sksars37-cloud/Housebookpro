import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Calculate appropriate base URL for GitHub Pages / sub-paths
function resolveBase(): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.endsWith('/') ? process.env.BASE_URL : `${process.env.BASE_URL}/`;
  }
  // When building in GitHub Actions, GITHUB_REPOSITORY is automatically provided (e.g. 'user/my-repo')
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1];
    // If repository name is username.github.io (user page), base is root '/'
    if (repo && repo.toLowerCase().endsWith('.github.io')) {
      return '/';
    }
    if (repo) {
      return `/${repo}/`;
    }
  }
  // Default to relative base for universal compatibility
  return './';
}

export default defineConfig(() => {
  return {
    base: resolveBase(),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
