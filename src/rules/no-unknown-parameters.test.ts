import { RuleTester } from "oxlint/plugins-dev";

import { noUnknownParametersRule } from "./no-unknown-parameters.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "unknownParameter" };
const allowInTypeGuards = [{ allowInTypeGuards: true }];

tester.run("anti-slop/no-unknown-parameters", noUnknownParametersRule, {
	valid: [
		"function handle(input: User) {}",
		"function handle(input) {}",
		"function enrich(cause: unknown): void {}",
		"function enrich(cause: Error | unknown): void {}",
		"type Cause = (cause: unknown) => void;",
		"function parse(error: unknown) { return error; }",
		"const parse = (error: unknown) => error;",
		"function isString(value: unknown): value is string { return true; }",
		"const isString = (value: unknown): value is string => true;",
		"function assertString(value: unknown): asserts value is string {}",
		"type Guard = (value: unknown) => value is string;",
		"declare function isString(value: unknown): value is string;",
		"type Guards = { isString(value: unknown): value is string };",
		"interface Guard { isString(value: unknown): value is string }",
		"function parse(value: string | number): void {}",
		{
			code: "function isString(value: unknown, context: unknown): value is string { return true; }",
			options: allowInTypeGuards,
		},
		{
			code: "function assertString(value: unknown, context: unknown): asserts value is string {}",
			options: allowInTypeGuards,
		},
	],
	invalid: [
		{ code: "function parse(value: unknown): void {}", errors: [error] },
		{ code: "const handle = (input: unknown) => input;", errors: [error] },
		{ code: "function handle(err: unknown) {}", errors: [error] },
		{ code: "type Handler = (input: unknown) => void;", errors: [error] },
		{ code: "interface Handler { handle(input: unknown): void }", errors: [error] },
		{ code: "declare function handle(input: unknown);", errors: [error] },
		{ code: "function parse(value: string | unknown): void {}", errors: [error] },
		{
			code: "function parse(value: string | (number | unknown)): void {}",
			errors: [error],
		},
		{
			code: "function isString(value: unknown, context: unknown): value is string { return true; }",
			errors: [{ ...error, data: { parameter: "context" } }],
		},
		{
			code: "export function parse({ value }: unknown = {}): void {}",
			errors: [{ ...error, data: { parameter: "{ value }" } }],
		},
		{
			code: "function parse(value: unknown): string { return String(value); }",
			options: allowInTypeGuards,
			errors: [error],
		},
		{
			code: "function isString(value: unknown): value is string { const parse = (input: unknown) => input; return parse(value) === value; }",
			options: allowInTypeGuards,
			errors: [error],
		},
	],
});
