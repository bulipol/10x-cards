# MCP Implementation Plan Creation

You are a **software architect** whose task is to create an **MCP (Model Context Protocol) server implementation plan** based on information provided from the planning session, product requirements document (PRD), and technology stack. Your goal is to design a clear and efficient implementation plan that meets project requirements and leverages the chosen technologies.

<session_notes>
{{session-notes}}

</session_notes>

This is a summary of the MCP server planning session. It contains key decisions, considerations, identified tools/resources/prompts, their schemas, and specific requirements discussed during planning.

<tech_stack>
{{tech-stack}}

</tech_stack>

Describes the technology stack that will be used in the project (e.g., Node.js, TypeScript, Cloudflare Workers, `@modelcontextprotocol/sdk/server/mcp.js`, Zod), which may affect implementation decisions.

Perform the following steps to create the MCP server implementation plan:

1.  Carefully analyze the **planning session summary (`<session_notes>`)**, identifying key tools, resources, prompts, their schemas, data sources, response structure, and error handling strategy.
2.  Analyze the **technology stack (`<tech_stack>`)** and ensure the implementation plan is optimized for the chosen technologies and their best practices (e.g., using Zod for validation, asynchronicity in Cloudflare Workers).

4.  Create a **comprehensive MCP server implementation plan** that includes:
    a.  Proposed **file and directory structure** for the MCP server project.
    b.  Identification of **key modules/files** to create or modify (e.g., `index.ts`, `tools/rulesTools.ts`, `data/rulesProvider.ts`).
    c.  Detailed **definitions for each Tool/Resource/Prompt**:
        *   Name, description.
        *   Input and output schemas (e.g., in Zod syntax).
        *   High-level description of `execute` function logic, including interactions with data sources, processing, and error handling.
        *   Method of result wrapping for MCP SDK (e.g., `{ content: [...] }`).
    d.  Implementation plan for **data providers** or modules for interacting with external APIs/databases.
    e.  Details of **MCP server instance configuration** (e.g., in `new McpServer(...)`).
    f.  Specific assumptions regarding **error handling strategy** implementation.
    g.  Outline of **testing strategy** (e.g., unit tests for tool logic, integration tests using MCP inspector).

5.  Describe the **tool registration** process in the main server file (e.g., in the `init()` method), taking into account SDK requirements for passing schemas and callbacks.

6.  Identify any necessary entries in the **deployment environment configuration file** (e.g., `wrangler.jsonc`) or required environment variables/secrets.

7.  Ensure the plan complies with **best practices** for the chosen framework (e.g., Cloudflare Workers, MCP SDK) and language (TypeScript), including asynchronous handling, dependency management, and code readability.

The final result should have the following structure (in Markdown format):

```markdown
### MCP Server Implementation Plan

#### 1. Project Structure
   - [Outline of proposed directory and file structure]

#### 2. Key Modules
   - **`src/index.ts`**:
       - [Description of McpServer initialization, tool registration, fetch handling]
   - **`src/tools/` (or `src/tools/rulesTools.ts`)**:
       - [Description of tool module/modules contents]
   - **`src/data/` (or `src/data/rulesProvider.ts`)**:
       - [Description of data provider module/modules contents]
   - **Other (e.g., `src/types.ts`)**:
       - [Description of other needed modules]

#### 3. Tool/Resource/Prompt Definitions
   - **Tool: `[tool_name_1]`**
       - Description: `[Tool description]`
       - Input Schema (Zod): `[Zod schema definition]`
       - Output Schema (Zod): `[Zod schema definition]`
       - `execute` Logic: `[Implementation steps, interactions, error handling]`
       - Result Wrapping for SDK: `[Example structure, e.g., { content: [...] }]`
   - **Tool: `[tool_name_2]`**
       - ... (as above)
   - ... (for all tools/resources/prompts)

#### 4. Data Handling
   - [Description of method of access and data processing, e.g., from preparedRules.json]

#### 5. Server and Deployment Configuration
   - `McpServer` Configuration: `[Settings in new McpServer(...)]`
   - `wrangler.jsonc` / `wrangler.toml` Configuration: `[Required settings]`
   - Environment Variables / Secrets: `[List of required variables]`

#### 6. Error Handling
   - [Description of error handling implementation strategy and message format]

#### 7. Testing Strategy
   - Unit Tests: `[Approach to testing tool/data logic]`
   - Integration Tests: `[Usage plan e.g., @modelcontextprotocol/inspector]`

#### 8. Additional Notes
   - [Any other relevant notes, potential risks, design decisions]
```

The response should include **only the final MCP server implementation plan in markdown format**, which you will save in the `.ai/mcp-implementation-plan.md` file, without including the thought process or intermediate steps. Ensure the plan is comprehensive, well organized, and ready to use as a guide during MCP server implementation.
