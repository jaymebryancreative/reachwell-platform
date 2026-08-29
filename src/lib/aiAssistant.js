import { supabase } from './supabaseClient';

/**
 * Permission-aware AI assistant foundation.
 *
 * IMPORTANT:
 * - The browser never contains an AI provider secret.
 * - Requests go to a server-side function.
 * - The server must validate the signed-in user and organization before
 *   retrieving any operational context or performing an action.
 */

export async function askAiAssistant({ message, pageContext = {}, conversation = [] }) {
  if (!message?.trim()) throw new Error('Please enter a question for the assistant.');

  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      message: message.trim(),
      pageContext: sanitizePageContext(pageContext),
      conversation: conversation.slice(-12),
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Proposed actions must always be previewed and explicitly confirmed by a user.
 * The Edge Function should return an action id/token bound to the current user.
 */
export async function confirmAiAction(actionId) {
  if (!actionId) throw new Error('Missing AI action confirmation id.');

  const { data, error } = await supabase.functions.invoke('ai-assistant-action', {
    body: { actionId, confirmed: true },
  });

  if (error) throw error;
  return data;
}

export function sanitizePageContext(context) {
  const allowed = [
    'module',
    'route',
    'recordType',
    'recordId',
    'screenTitle',
  ];

  return Object.fromEntries(
    allowed
      .filter((key) => context[key] !== undefined && context[key] !== null)
      .map((key) => [key, String(context[key]).slice(0, 200)])
  );
}

export const AI_ASSISTANT_SAFETY_RULES = [
  'AI access must never exceed the current user\'s permissions.',
  'AI must use approved server-side tools instead of unrestricted database access.',
  'Sensitive or consequential actions require explicit confirmation.',
  'Permanent deletion, ownership changes, and high-impact financial actions require additional safeguards.',
  'Only the minimum necessary organization information should be supplied to the AI provider.',
  'Important AI-proposed and AI-executed actions should be auditable.',
];
