// Frontmatter parsing for ARC entity files

import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import type { Entity } from "../types";
import { getTypeFromId } from "../types";
import { getDescriptor } from "../entities/registry";
import type { RawFrontmatter } from "../entities/descriptor";

export type { RawFrontmatter } from "../entities/descriptor";

/**
 * Parse a markdown file with YAML frontmatter into an Entity.
 */
export function parseEntity(content: string, filePath: string): Entity {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) {
		throw new Error(
			`Invalid entity file: ${filePath}. Missing --- frontmatter delimiters.`,
		);
	}

	const [, frontmatterRaw, bodyRaw] = match;
	let meta: RawFrontmatter;
	try {
		meta = yamlParse(frontmatterRaw) as RawFrontmatter;
	} catch (e) {
		throw new Error(`Invalid YAML in ${filePath}: ${(e as Error).message}`);
	}

	if (!meta.id) throw new Error(`Missing id in ${filePath}`);
	if (!meta.title) throw new Error(`Missing title in ${filePath}`);

	const type = getTypeFromId(meta.id);
	const body = bodyRaw.trim();
	const date = meta.date ?? new Date().toISOString().split("T")[0];
	const tags = meta.tags ?? [];

	const base = {
		id: meta.id,
		title: meta.title,
		date,
		tags,
		body,
		filePath,
		context: meta.context,
	};

	return getDescriptor(type).parse(meta, base);
}

/**
 * Serialize entity frontmatter back to YAML string.
 */
export function serializeFrontmatter(entity: Entity): string {
	const desc = getDescriptor(entity.type);

	const frontmatter: Record<string, unknown> = {
		id: entity.id,
		title: entity.title,
		status: entity.status,
		date: entity.date,
	};

	if (entity.tags.length > 0) {
		frontmatter.tags = entity.tags;
	}

	if (entity.context) {
		frontmatter.context = entity.context;
	}

	// Append type-specific fields
	const typeFields = desc.jsonFields(entity as any);
	Object.assign(frontmatter, typeFields);

	return yamlStringify(frontmatter, { lineWidth: 0 });
}

/**
 * Build the full markdown file content for an entity.
 */
export function serializeEntity(entity: Entity): string {
	const frontmatter = serializeFrontmatter(entity);
	return `---\n${frontmatter}---\n\n${entity.body}\n`;
}
