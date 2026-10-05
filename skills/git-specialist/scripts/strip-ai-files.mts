#!/usr/bin/env node
/**
 * Reescribe el historial de commits desde origin/<base> hasta HEAD,
 * eliminando los archivos de configuración de IA de cada commit
 * para mantener el repositorio remoto limpio sin afectar el local.
 * 
 * Uso: node strip-ai-files.mts <base>
 */
import { execSync, spawnSync } from 'node:child_process';
import { env } from 'node:process';

const filesToStrip = ['skills', '.agents', 'GEMINI.md', 'AGENTS.md'];
const base = process.argv[2] || 'main';

try {
  const mergeBase = execSync(`git merge-base origin/${base} HEAD`, { encoding: 'utf-8' }).trim();
  const commits = execSync(`git rev-list --reverse ${mergeBase}..HEAD`, { encoding: 'utf-8' })
    .trim().split('\n').filter(Boolean);

  if (commits.length === 0) {
    console.log('No hay commits para filtrar.');
    process.exit(0);
  }

  const hashMap = new Map<string, string>();

  for (const commit of commits) {
    const format = '%P%n%an%n%ae%n%ad%n%cn%n%ce%n%cd%n%B';
    const info = execSync(`git show -s --format="${format}" ${commit}`, { encoding: 'utf-8' });
    const lines = info.split('\n');
    const parentsLine = lines.shift() || '';
    const an = lines.shift() || '';
    const ae = lines.shift() || '';
    const ad = lines.shift() || '';
    const cn = lines.shift() || '';
    const ce = lines.shift() || '';
    const cd = lines.shift() || '';
    const message = lines.join('\n');

    const parents = parentsLine.trim().split(' ').filter(Boolean);

    const commitEnv = {
      ...env,
      GIT_INDEX_FILE: '.git/publish_index',
      GIT_AUTHOR_NAME: an,
      GIT_AUTHOR_EMAIL: ae,
      GIT_AUTHOR_DATE: ad,
      GIT_COMMITTER_NAME: cn,
      GIT_COMMITTER_EMAIL: ce,
      GIT_COMMITTER_DATE: cd,
    };

    // Clean shadow index
    execSync('rm -f .git/publish_index');

    // Load commit tree into shadow index
    execSync(`git read-tree ${commit}`, { env: commitEnv, stdio: 'ignore' });

    // Strip files from shadow index silently
    for (const file of filesToStrip) {
      try {
        execSync(`git rm --cached -r -q --ignore-unmatch ${file}`, { env: commitEnv, stdio: 'ignore' });
      } catch (e) {}
    }

    // Write new tree
    const newTree = execSync(`git write-tree`, { env: commitEnv, encoding: 'utf-8' }).trim();

    // Re-map parents to their new hashes
    const newParents = parents.map((p) => hashMap.get(p) || p);
    const parentArgs = newParents.flatMap((p) => ['-p', p]);

    // Create the clean commit
    const result = spawnSync('git', ['commit-tree', newTree, ...parentArgs], {
      input: message,
      env: commitEnv,
      encoding: 'utf-8'
    });
    
    if (result.status !== 0) {
      console.error(`Error reconstruyendo commit ${commit}: ${result.stderr}`);
      process.exit(1);
    }
    
    const newHash = result.stdout.trim();
    hashMap.set(commit, newHash);
  }

  const finalHash = hashMap.get(commits[commits.length - 1]);
  if (finalHash) {
    execSync(`git update-ref refs/heads/publish_temp ${finalHash}`);
    console.log(`✅ Historial purgado. Nueva cabeza temporal: ${finalHash.substring(0,7)}`);
  }
} catch (error) {
  console.error('❌ Fallo fatal filtrando el historial:', error);
  process.exit(1);
}
