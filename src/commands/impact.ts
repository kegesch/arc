// arc impact <id>
import { readAllEntities, requireArcProject } from '../io/files.js';
import { buildGraph, impactAnalysis } from '../graph/graph.js';
import { formatEntityBrief, colorId, red, yellow, bold, dim } from '../display/format.js';
import type { Entity } from '../types.js';
import { EntityNotFound } from '../core/errors.js';

// ─── Pure logic types ───

export interface ImpactResult {
  entity: Entity;
  direct: Entity[];
  transitive: Entity[];
}

// ─── Pure logic ───

export function getImpactResult(dir: string, id: string): ImpactResult {
  const entities = readAllEntities(dir);
  const graph = buildGraph(entities);

  const entity = graph.entities.get(id);
  if (!entity) throw new EntityNotFound(id);

  const { direct, transitive } = impactAnalysis(graph, id);
  return { entity, direct, transitive };
}

// ─── CLI entry point ───

function entitySummary(e: Entity) {
  return { id: e.id, title: e.title, type: e.type, status: e.status };
}

export function impactCommand(id: string, options?: { format?: string }): void {
  requireArcProject();

  const result = getImpactResult(process.cwd(), id);

  if (options?.format === 'json') {
    const output = {
      entity: entitySummary(result.entity),
      direct: result.direct.map(entitySummary),
      transitive: result.transitive.map(entitySummary),
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  const statusWarning = result.entity.type === 'assumption' && result.entity.status === 'unvalidated'
    ? yellow(' (unvalidated)')
    : result.entity.type === 'assumption' && result.entity.status === 'invalidated'
    ? red(' (invalidated)')
    : '';

  console.log(bold(`Impact of changing ${colorId(result.entity.id)} "${result.entity.title}"${statusWarning}:`));
  console.log('');

  if (result.direct.length === 0) {
    console.log(dim('  No direct dependents.'));
    return;
  }

  console.log('Direct dependents:');
  for (const dep of result.direct) {
    console.log(`  ${formatEntityBrief(dep)}`);
  }

  if (result.transitive.length > 0) {
    console.log('');
    console.log('Transitive impact:');
    for (const dep of result.transitive) {
      console.log(`  ${formatEntityBrief(dep)}`);
    }
  }

  const total = result.direct.length + result.transitive.length;
  console.log('');
  console.log(dim(`  ${total} entities affected (${result.direct.length} direct, ${result.transitive.length} transitive)`));
}
