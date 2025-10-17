import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Load tenant configuration
export function loadTenantConfig() {
  // In production (Netlify), files are in /var/task, in dev they're in project root
  const possiblePaths = [
    join(process.cwd(), 'public', 'tenants.yml'),
    join(process.cwd(), 'tenants.yml'),
    join('/var/task', 'public', 'tenants.yml')
  ];

  for (const configPath of possiblePaths) {
    try {
      const configFile = readFileSync(configPath, 'utf8');
      return yaml.load(configFile);
    } catch (error) {
      // Try next path
      continue;
    }
  }

  throw new Error('Could not find tenants.yml');
}
