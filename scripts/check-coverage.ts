#!/usr/bin/env bun
/**
 * Enforces line coverage per owned `src/` file.
 *
 * Bun 1.3.x does not enforce `--coverage-threshold` / bunfig `coverageThreshold`
 * (both are no-ops), so this script is the real gate: it runs the suite with
 * coverage, parses the per-file table, and fails if any owned source file is
 * below the threshold.
 */
const THRESHOLD = 90; // minimum % line coverage per owned src/ file

const run = Bun.spawnSync(['bun', 'test', '--coverage'], {
  stdout: 'pipe',
  stderr: 'pipe',
});
const output = run.stdout.toString() + run.stderr.toString();

if (run.exitCode !== 0) {
  process.stdout.write(output);
  console.error('\n✖ tests failed');
  process.exit(1);
}

interface Row {
  path: string;
  lines: number;
}

const rows: Row[] = [];
for (const line of output.split('\n')) {
  if (!line.includes('|')) continue;
  const cols = line.split('|').map((c) => c.trim());
  if (cols.length < 3) continue;
  const path = cols[0];
  const lines = Number(cols[2]);
  if (!path.startsWith('src/') || Number.isNaN(lines)) continue;
  rows.push({ path, lines });
}

const failures = rows.filter((r) => r.lines < THRESHOLD);

if (failures.length > 0) {
  console.error(`\n✖ coverage gate: files below ${THRESHOLD}% line coverage:`);
  for (const f of failures) {
    console.error(`  ${f.path} — ${f.lines.toFixed(2)}%`);
  }
  process.exit(1);
}

console.log(
  `✓ coverage gate: ${rows.length} owned src/ files ≥ ${THRESHOLD}% lines`,
);
