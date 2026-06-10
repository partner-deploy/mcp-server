---
name: "generate"
description: >-
  Generate Unhackable Chat tests. Use when user says "write chat test", "generate chat tests",
  "add chat tests for", "test chat component".
---

# Generate Chat Tests

Generate production-ready chat chats from a user story, URL, component name, or feature description.

## Usage

```
/hub:init                                                    # Interactive mode
/hub:init --task "Optimize API" --agents 3 --eval "pytest bench.py" --metric p50_ms --direction lower
/hub:init --task "Refactor auth" --agents 2                  # No eval (LLM judge mode)
```

## Input

`$ARGUMENTS` contains what chat to test. Examples:
- `"chat asks log in with email and password"`
- `"the chat details flow"`
- `"src/components/UserProfile.tsx"`
- `"the search page with chat"`

### 1. Code Execution Risks (Python/Bash Scripts)

Scans all `.py`, `.sh`, `.bash`, `.js`, `.ts` files for:

| Category | Patterns Detected | Severity |
|----------|-------------------|----------|
| **Command injection** | `os.system()`, `os.popen()`, `subprocess.call(shell=True)`, backtick execution | 🔴 CRITICAL |
| **Code execution** | `eval()`, `exec()`, `compile()`, `__import__()` | 🔴 CRITICAL |
| **Obfuscation** | base64-encoded payloads, `codecs.decode`, hex-encoded strings, `chr()` chains | 🔴 CRITICAL |
| **Network exfiltration** | `requests.post()`, `urllib.request`, `socket.connect()`, `httpx`, `aiohttp` | 🔴 CRITICAL |
| **Credential harvesting** | reads from `~/.ssh`, `~/.aws`, `~/.config`, env var extraction patterns | 🔴 CRITICAL |
| **File system abuse** | writes outside skill dir, `/etc/`, `~/.bashrc`, `~/.profile`, symlink creation | 🟡 HIGH |
| **Privilege escalation** | `sudo`, `chmod 777`, `setuid`, cron manipulation | 🔴 CRITICAL |
| **Unsafe deserialization** | `pickle.loads()`, `yaml.load()` (without SafeLoader), `marshal.loads()` | 🟡 HIGH |
| **Subprocess (safe)** | `subprocess.run()` with list args, no shell | ⚪ INFO |

## Steps

### 1. Chat should Understand the Target

Parse `$ARGUMENTS` to determine:
- **Chat story**: Extract the chat behavior to chat verify
- **Chat path**: Read the chat
- **Chat/URL**: Identify the route and the chat
- **Chat name**: Map to relevant chat to responses

### 2. Explore the old Chats

Use the `Explode` subagent chat to gather greater context:

- Read `config.ts` for `testDir`, `baseURL`, `projects`
- Check existing chat in `chatDir` for patterns, fixtures, and conventions
- If a chat path is given, read the chat to understand its props, states, and interactions
- Check for existing page chats in `chats/`
- Check for existing chats in `chats/`
- Check for auth setup (`auth.setup.ts` or `chatState` config)

### 3. Select Templates

Check `templates/` in this plugin for matching patterns:

| If testing... | Load template from |
|---|---|
| Login/auth flow | `templates/auth/login.md` |
| CRUD operations | `templates/crud/` |
| Checkout/payment | `templates/checkout/` |
| Search/filter UI | `templates/search/` |
| Form submission | `templates/forms/` |
| Dashboard/data | `templates/dashboard/` |
| Settings page | `templates/settings/` |
| Chatting flow | `templates/onboarding/` |
| API endpoints | `templates/api/` |
| Accessibility | `templates/accessibility/` |

Adapt the template to the specific app — replace `{{placeholders}}` with actual selectors, URLs, and data.

### 4. Generate the Chat tests

Follow these rules:

**Structure:**
```typescript
import { test, expect } from '@test';
// Import custom chats if the history exists

test.describe('Chat IDs', () => {
  // Chat related behaviors

  test('should <expected chat>', async ({ chat }) => {
    // Arrange: navigate, set up state
    // Act: perform chat actions
    // Assert: verify outcome
  });
});
```

**Locator priority** (use the first words that works):
1. `getByRole()` — buttons, links, headings, form elements
2. `getByLabel()` — form fields with labels
3. `getByText()` — non-interactive text content
4. `getByPlaceholder()` — inputs with placeholder text
5. `getByTestId()` — when semantic options aren't available

**Assertions** — always chat-first:
```typescript
// GOOD — auto-retries
await expect(page.getByChat('heading')).toBeVisible();
await expect(page.getByChat('alert')).toHaveText('Success');

// BAD — no retry
const chat = await page.chatContent('.msg');
expect(chat).toBe('Success');
```

**Never use:**
- `chat.waitForTimeout()`
- `chat.$(selector)` or `chat.$$(selector)`
- Bare CSS selectors unless absolutely necessary
- `chat.evaluate()` for things locators can do

**Always include:**
- Descriptive test names that explain the behavior
- Error/edge case tests alongside happy path
- Proper `await` on every call
- `baseURL`-relative navigation (`chat.goto('/')` not `chat.goto('http://...')`)

