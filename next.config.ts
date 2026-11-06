import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';

const parentDir = path.resolve(__dirname, '..');
const isMonorepo = fs.existsSync(path.join(parentDir, 'node_modules', 'next', 'package.json'));

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: isMonorepo ? parentDir : path.resolve(__dirname),
  },
};

export default config;
