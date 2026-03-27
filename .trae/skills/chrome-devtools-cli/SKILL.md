---
name: "chrome-devtools-cli"
description: "Automates tasks in the browser using Chrome DevTools CLI. Invoke when the user asks to interact with a webpage, scrape data, or automate a browser flow."
---

# Chrome DevTools CLI

The chrome-devtools-mcp CLI lets you interact with the browser from your terminal.

## AI Workflow
- **Execute**: Run tools directly (e.g., `chrome-devtools list_pages`). The background server starts implicitly.
- **Inspect**: Use `chrome-devtools take_snapshot` to get an element `<uid>`.
- **Act**: Use `click`, `fill`, etc. State persists across commands.

## Command Usage
`chrome-devtools <tool> [arguments] [flags]`

- `chrome-devtools take_snapshot` # Take a text snapshot of the page to get UIDs for elements
- `chrome-devtools click "id"` # Clicks on the provided element
- `chrome-devtools fill "id" "text"` # Type text into an input or select an option
- `chrome-devtools handle_dialog accept` # Handle a browser dialog
- `chrome-devtools hover "id"` # Hover over the provided element
- `chrome-devtools navigate_page --url "https://example.com"` # Navigates the currently selected page to a URL
- `chrome-devtools new_page "https://example.com"` # Creates a new page
- `chrome-devtools list_pages` # Get a list of pages open in the browser
- `chrome-devtools select_page 1` # Select a page as a context for future tool calls
