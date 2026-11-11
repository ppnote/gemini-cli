/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  containsPseudoToolCall,
  PSEUDO_TOOL_CALL_ERROR_MESSAGE,
} from './pseudoToolCall.js';

describe('containsPseudoToolCall', () => {
  it('returns false for empty or ordinary assistant text', () => {
    expect(containsPseudoToolCall('')).toBe(false);
    expect(
      containsPseudoToolCall(
        'Need harder evidence. Let me dump the decrypted body of a frame.',
      ),
    ).toBe(false);
    expect(
      containsPseudoToolCall('Use a placeholder value while scaffolding.'),
    ).toBe(false);
  });

  it('detects opening and closing tool_call tags', () => {
    expect(containsPseudoToolCall('<tool_call>')).toBe(true);
    expect(containsPseudoToolCall('prefix </tool_call> suffix')).toBe(true);
    expect(containsPseudoToolCall('< tool_call >')).toBe(true);
  });

  it('detects <function=...> markup used by weak models', () => {
    expect(containsPseudoToolCall('<function=run_shell=command>')).toBe(true);
    expect(containsPseudoToolCall('<function=run_shell_command>')).toBe(true);
  });

  it('detects placeholder empty-shell parameters', () => {
    expect(
      containsPseudoToolCall('<parameter=command>\nplaceholder\n</parameter>'),
    ).toBe(true);
    expect(
      containsPseudoToolCall(
        '<parameter name="command">placeholder</parameter>',
      ),
    ).toBe(true);
  });

  it('detects the full qwen-style dumped tool call', () => {
    const dumped = `
Need harder evidence. Let me dump the full decrypted body.

<tool_call>
<function=run_shell=command>
</parameter>
<parameter=command>
placeholder
</parameter>
</function>
</tool_call>
`;
    expect(containsPseudoToolCall(dumped)).toBe(true);
  });

  it('exports an actionable error message', () => {
    expect(PSEUDO_TOOL_CALL_ERROR_MESSAGE).toMatch(/retry/i);
    expect(PSEUDO_TOOL_CALL_ERROR_MESSAGE).toMatch(/tool call/i);
  });
});
