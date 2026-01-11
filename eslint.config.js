import nkzw from '@nkzw/eslint-config';

export default [
  ...nkzw,
  {
    ignores: [
      'build/',
      'dist/',
      'src/router/routeTree.gen.ts',
      'vite.config.ts.timestamp-*',
    ],
  },
];
