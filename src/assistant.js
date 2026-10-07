import Anthropic from '@anthropic-ai/sdk';
import { db } from './db.js';
import { addDeadline, deleteDeadline, listDeadlines } from './deadlines.js';

const client = new Anthropic();
const MAX_TOOL_ROUNDS = 5;

const SYSTEM = `You are the AI assistant inside a client's account at The Business Builder, a digital agency for small businesses ("Build It. Brand It. Grow It.").
Help the owner run their business: marketing, customers, websites, Google and social media, planning and everyday questions. Be practical, brief and plain-spoken.
You can manage the owner's deadlines with your tools. Every deadline gets email reminders before it is due. When the owner mentions something with a due date, offer to add it. Confirm dates in the owner's timezone.`;

const TOOLS = [
  {
    name: 'list_deadlines',
    description: "List the owner's upcoming deadlines with their ids and due times (UTC).",
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
    strict: true,
  },
  {
    name: 'add_deadline',
    description: 'Add a deadline. Email reminders are sent automatically before it is due.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short name, e.g. "Quarterly taxes"' },
        due_at: { type: 'string', description: 'ISO 8601 date-time with a UTC offset' },
      },
      required: ['title', 'due_at'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: 'delete_deadline',
    description: 'Delete a deadline by id.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'integer' } },
      required: ['id'],
      additionalProperties: false,
    },
    strict: true,
  },
];

function runTool(userId, name, input) {
  switch (name) {
    case 'list_deadlines': return listDeadlines(userId);
    case 'add_deadline': return addDeadline(userId, input);
    case 'delete_deadline': return { deleted: deleteDeadline(userId, input.id) };
    default: throw new Error(`Unknown tool ${name}`);
  }
}

function loadMessages(userId) {
  const row = db.prepare('SELECT messages FROM chats WHERE user_id = ?').get(userId);
  return row ? JSON.parse(row.messages) : [];
}

function saveMessages(userId, messages) {
  db.prepare(`
    INSERT INTO chats (user_id, messages) VALUES (?, ?)
    ON CONFLICT (user_id) DO UPDATE SET messages = excluded.messages`)
    .run(userId, JSON.stringify(messages));
}

/** The conversation as the page shows it: plain text turns only. */
export function chatHistory(userId) {
  return loadMessages(userId).flatMap(({ role, content }) => {
    const texts = content.filter((b) => b.type === 'text').map((b) => b.text);
    // A user turn's second text block is the context note added by chat().
    const text = role === 'user' ? texts[0] : texts.join('\n');
    return text ? [{ role, text }] : [];
  });
}

export function clearChat(userId) {
  db.prepare('DELETE FROM chats WHERE user_id = ?').run(userId);
}

export async function chat(user, text) {
  const messages = loadMessages(user.id);
  const now = new Date().toLocaleString('en-US', { timeZone: user.timezone, dateStyle: 'full', timeStyle: 'short' });
  messages.push({
    role: 'user',
    content: [
      { type: 'text', text },
      { type: 'text', text: `(Owner: ${user.name}. Now: ${now}, timezone ${user.timezone}.)` },
    ],
  });

  let reply = '';
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === 'refusal') {
      reply = "Sorry, I can't help with that one.";
      messages.pop();
      break;
    }

    messages.push({ role: 'assistant', content: response.content });
    reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    if (response.stop_reason !== 'tool_use') break;

    const results = response.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => {
        try {
          return { type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(runTool(user.id, b.name, b.input)) };
        } catch (err) {
          return { type: 'tool_result', tool_use_id: b.id, content: err.message, is_error: true };
        }
      });
    messages.push({ role: 'user', content: results });
  }

  saveMessages(user.id, messages);
  return reply;
}
