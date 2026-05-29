// arc trace <id>
import { readAllEntities, requireArcProject } from '../io/files.js';
import { buildGraph, traceUp, type TraceNode } from '../graph/graph.js';
import { findUnvalidatedAssumptions } from '../graph/analysis.js';
import { formatTraceTree, colorId, yellow, dim } from '../display/format.js';
import type { Entity } from '../types.js';
import { EntityNotFound } from '../core/errors.js';

// ─── Pure logic types ───

export interface TraceResult {
  tree: TraceNode;
  unvalidated: Entity[];
}

// ─── Pure logic ───

export function getTraceResult(dir: string, id: string): TraceResult {
  const entities = readAllEntities(dir);
  const graph = buildGraph(entities);

  if (!graph.entities.has(id)) throw new EntityNotFound(id);

  const tree = traceUp(graph, id);
  if (!tree) throw new Error('Could not build trace tree.');

  const unvalidated = findUnvalidatedInTree(tree);
  return { tree, unvalidated };
}

function findUnvalidatedInTree(node: TraceNode): Entity[] {
  const result: Entity[] = [];
  if (node.entity.type === 'assumption' && node.entity.status === 'unvalidated') {
    result.push(node.entity);
  }
  for (const child of node.children) {
    result.push(...findUnvalidatedInTree(child));
  }
  return result;
}

// ─── CLI entry point ───

export function traceCommand(id: string): void {
  requireArcProject();

  try {
    const result = getTraceResult(process.cwd(), id);
    const lines = formatTraceTree(result.tree);
    console.log(lines.join('\n'));

    if (result.unvalidated.length > 0) {
      console.log('');
      console.log(yellow(`⚠ ${result.unvalidated.length} unvalidated assumption(s) in this trace:`));
      for (const a of result.unvalidated) {
        console.log(`  ○ ${colorId(a.id)} ${a.title}`);
      }
    }
  } catch (e) {
    if (e instanceof EntityNotFound) {
      console.error(`Entity ${colorId(e.id)} not found.`);
      return;
    }
    throw e;
  }
}
