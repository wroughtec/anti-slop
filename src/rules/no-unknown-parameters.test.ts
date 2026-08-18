import { RuleTester } from "oxlint/plugins-dev";

import { noUnknownParametersRule } from "./no-unknown-parameters.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "unknownParameter" };
const allowInTypeGuards = [{ allowInTypeGuards: true }];

tester.run("anti-slop/no-unknown-parameters", noUnknownParametersRule, {
  valid: [
    "function handle(input: User) {}",
    "function handle(input) {}",
    "function handle(cause: unknown) {}",
    "function parse(error: unknown) { return error; }",
    "const parse = (error: unknown) => error;",
    "type Cause = (cause: unknown) => void;",
    {
      code: "function isString(value: unknown): value is string { return true; }",
      options: allowInTypeGuards,
    },
    {
      code: "const isString = (value: unknown): value is string => true;",
      options: allowInTypeGuards,
    },
    {
      code: "function assertString(value: unknown): asserts value is string {}",
      options: allowInTypeGuards,
    },
    {
      code: "type Guard = (value: unknown) => value is string;",
      options: allowInTypeGuards,
    },
    {
      code: "interface Guard { isString(value: unknown): value is string }",
      options: allowInTypeGuards,
    },
  ],
  invalid: [
    { code: "function handle(input: unknown) {}", errors: [error] },
    { code: "const handle = (input: unknown) => input;", errors: [error] },
    { code: "function handle(err: unknown) {}", errors: [error] },
    { code: "type Handler = (input: unknown) => void;", errors: [error] },
    { code: "interface Handler { handle(input: unknown): void }", errors: [error] },
    { code: "declare function handle(input: unknown);", errors: [error] },
    {
      code: "function isString(value: unknown): value is string { return true; }",
      errors: [error],
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
