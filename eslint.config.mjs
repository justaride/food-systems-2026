import nextConfig from 'eslint-config-next'

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'node_modules.old.*/**',
      '.worktrees/**',
      'src/generated/**',
      'public/**',
      'research/**',
      'docs/**',
      '.playwright-cli/**',
      '.playwright-mcp/**',
      'out/**',
      'Food Systems Obsidian/.obsidian/plugins/**',
    ],
  },
  ...nextConfig,
]

export default config
