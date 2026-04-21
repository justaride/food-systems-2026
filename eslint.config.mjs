import nextConfig from 'eslint-config-next'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
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
