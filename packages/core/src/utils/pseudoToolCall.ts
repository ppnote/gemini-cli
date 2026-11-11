/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Message shown when a model prints a tool invocation as plain text
 * instead of a native functionCall (common with weaker local models).
 */
export const PSEUDO_TOOL_CALL_ERROR_MESSAGE =
  'Invalid tool call format: the model printed a <tool_call> / <function=...> block as plain text instead of issuing a native function call. Please retry, or switch to a model that supports tool calling.';

// Opening or closing XML-style tool_call tags.
const TOOL_CALL_TAG = /<\s*\/?\s*tool_call\b/i;

// Weak-model markup such as <function=run_shell> or <function=run_shell=command>.
const FUNCTION_EQUALS_TAG = /<\s*function\s*=\s*[\w.:-]+/i;

// Empty-shell parameter whose value is the literal "placeholder".
const PLACEHOLDER_PARAMETER =
  /<\s*parameter(?:\s|=)[^>]*>\s*placeholder\s*<\s*\/\s*parameter\s*>/i;

/**
 * Returns true when model response text looks like a fabricated tool call
 * written as plain text, rather than a structured functionCall part.
 */
export function containsPseudoToolCall(text: string): boolean {
  if (!text) {
    return false;
  }
  return (
    TOOL_CALL_TAG.test(text) ||
    FUNCTION_EQUALS_TAG.test(text) ||
    PLACEHOLDER_PARAMETER.test(text)
  );
}
