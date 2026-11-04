const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeps = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  'react',
  'react-native',
]);

const missing = new Map();

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      const regex = /(?:import|from)\s+['"]([^'".\/][^'"]*)['"]/g;
      let match;
      while ((match = regex.exec(code)) !== null) {
        let name = match[1];
        if (name.startsWith('@')) {
          name = name.split('/').slice(0, 2).join('/');
        } else {
          name = name.split('/')[0];
        }
        if (!allDeps.has(name)) {
          if (!missing.has(name)) missing.set(name, []);
          missing.get(name).push(full);
        }
      }
    }
  }
}

scan('src');
scan('app');
scan('components');

console.log('=== MISSING PACKAGES ===');
for (const [pkgName, files] of missing.entries()) {
  console.log(`Package: "${pkgName}"`);
  files.forEach(f => console.log(`  - ${f}`));
}
