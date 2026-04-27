import nextConfig from 'eslint-config-next'

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'node_modules.old.*/**',
      'src/generated/**',
      'public/**',
      'research/**',
      'docs/**',
      '.playwright-cli/**',
      '.playwright-mcp/**',
      'out/**',
    ],
  },
  ...nextConfig,
]

export default config
