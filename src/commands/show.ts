// arc show <id>
import { readAllEntities, requireArcProject } from '../io/files.js';
import { buildGraph, getDependents, getDependencies } from '../graph/graph.js';
import { formatEntityDetail, colorId, statusIcon } from '../display/format.js';
import type { Entity } from '../types.js';
import { EntityNotFound } from '../core/errors.js';

// ─── Pure logic types ───

export interface ShowResult {
  entity: Entity;
  dependencies: Entity[];
  dependents: Entity[];
}

// ─── Pure logic ───

export function getShowResult(dir: string, id: string): ShowResult {
  const entities = readAllEntities(dir);
  const entity = entities.find(e => e.id === id);
  if (!entity) throw new EntityNotFound(id);

  const graph = buildGraph(entities);
  const dependents = getDependents(graph, id);
  const dependencies = getDependencies(graph, id);

  return { entity, dependencies, dependents };
}

// ─── CLI entry point ───

export function showCommand(id: string, options?: { format?: string }): void {
  requireArcProject();

  const result = getShowResult(process.cwd(), id);

  if (options?.format === 'json') {
    const output = {
      ...result.entity,
      dependencies: result.dependencies.map((e) => ({ id: e.id, title: e.title, type: e.type, status: e.status })),
      dependents: result.dependents.map((e) => ({ id: e.id, title: e.title, type: e.type, status: e.status })),
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(formatEntityDetail(result.entity));

  if (result.dependencies.length > 0) {
    console.log(`\nDepends on:`);
    for (const dep of result.dependencies) {
      console.log(`  ${statusIcon(dep.status)} ${colorId(dep.id)} ${dep.title}`);
    }
  }

  if (result.dependents.length > 0) {
    console.log(`\nReferenced by:`);
    for (const dep of result.dependents) {
      console.log(`  ${statusIcon(dep.status)} ${colorId(dep.id)} ${dep.title}`);
    }
  }

  console.log(`\n  ${result.entity.filePath}`);
}
