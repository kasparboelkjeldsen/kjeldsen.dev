import type { Plugin } from 'rollup';

export function inspectChunks(limit = 12): Plugin {
  return {
    name: 'inspect-chunks',
    generateBundle(_opts, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'chunk') continue;
        const rawKb = (asset.code.length / 1024).toFixed(1);
        const modules = Object.entries(asset.modules)
          .map(([id, m]) => ({ id, kb: ((m as any).renderedLength || 0) / 1024 }))
          .sort((a, b) => b.kb - a.kb)
          .slice(0, limit);
        this.warn(`\nchunk ${fileName} — ${rawKb} kB\n` + modules.map(m => `  ${m.kb.toFixed(1).padStart(6)} kB  ${m.id}`).join('\n'));
      }
    }
  };
}
