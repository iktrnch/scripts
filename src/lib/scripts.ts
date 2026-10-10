export const riskValues = ['read-only', 'writes-files', 'system-changes'] as const;

export type ScriptRisk = (typeof riskValues)[number];
export type ScriptLanguage = 'python' | 'shell';

export interface ScriptRecord {
	slug: string;
	sourcePath: string;
	language: ScriptLanguage;
	name: string;
	description: string;
	category: string;
	platforms: string[];
	tags: string[];
	risk: ScriptRisk;
	usageExamples: string[];
	downloadUrl: string;
}
