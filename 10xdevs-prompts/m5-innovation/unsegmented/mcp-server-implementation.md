# MCP Server Implementation

Your task is to implement an **MCP (Model Context Protocol) server** based on the provided implementation plan and implementation rules. Your goal is to create a detailed and accurate implementation that complies with the provided plan, correctly defines tools, handles logic, and communicates according to the MCP protocol.

First review the implementation plan:
<implementation_plan>
{{implementation-plan}} <!-- Insert reference to .ai/mcp-implementation-plan.md file here -->

Create/modify server code in location: {{sciezka}} <!-- Specify base path, e.g., mcp-server/src -->
</implementation_plan>

Now review the implementation rules:
<implementation_rules>
{{implementation-rules}} <!-- Insert reference to appropriate implementation rules here (e.g., regarding TypeScript, Cloudflare Workers, Zod, etc.) -->
</implementation_rules>

Implement the plan according to the following approach:
<implementation_approach>
Implement a maximum of 3 steps of the implementation plan (e.g., structure definition, implementation of one module, implementation of one tool). After each group of steps, summarize briefly what was done and describe the plan for the next 3 actions. Stop work at this point and wait for my feedback before continuing.
</implementation_approach>

Carefully analyze the implementation plan and rules. Pay special attention to the project structure, tool definition, `execute` logic implementation, Zod schemas, interaction with data sources, error handling, and the method of tool registration in the MCP SDK.

Perform the following steps to implement the MCP server:

1.  **Project Structure and Main Server File:**
    *   Create or modify files and directories in location `{{sciezka}}` according to the structure described in the plan.
    *   In the main server file (e.g., `index.ts`), define a `MyMCP` class (or other according to the plan) extending `McpAgent`.
    *   Implement `McpServer` instance initialization with appropriate name and version.

2.  **Tool Module Implementation:**
    *   Create or modify files containing tool definitions (e.g., `tools/rulesTools.ts`).
    *   For each tool, define an exported object containing `name`, `description`.
    *   Implement Zod schemas (`inputSchema`, `outputSchema`) according to the specification in the plan.

3.  **Tool Logic Implementation (`execute`):**
    *   For each tool, implement an asynchronous `execute` function.
    *   Implement the business logic described in the plan, including interaction with data modules (e.g., `rulesProvider`).
    *   Ensure validation of input data (if not fully supported by SDK) and output data (e.g., using `outputSchema.safeParse`).

4.  **Data Provider Implementation:**
    *   Create or modify modules responsible for providing data (e.g., `data/rulesProvider.ts`).
    *   Implement functions according to the plan (e.g., reading and providing data from `preparedRules.json`).

5.  **Tool Registration in `init()`:**
    *   In the `init()` method of the `MyMCP` class, for each tool call `this.server.tool()`.
    *   Pass appropriate arguments according to SDK requirements (name, schema/description, callback function).
    *   Inside the callback function, call the appropriate tool `execute` function.
    *   Wrap the result from `execute` in the structure expected by the SDK (e.g., `{ content: [{ type: 'text', text: JSON.stringify(result) }] }`), according to agreements in the plan.

6.  **Error Handling:**
    *   Implement error handling in `execute` functions (e.g., `try...catch`, returning error object compliant with `outputSchema` schema).
    *   Handle validation errors (input/output).
    *   Ensure errors are properly formatted in the response for the SDK (e.g., setting `isError: true` in callback response, if SDK supports it).

7.  **Typing and Documentation:**
    *   Apply strong TypeScript typing throughout the code.
    *   Add JSDoc/TSDoc comments explaining the operation of key code fragments, especially tool logic and schemas.

8.  **Testing:**
    *   Organize code modularly, facilitating unit testing of tool and data provider logic.

Throughout the entire implementation process, you must strictly follow the provided implementation rules (`<implementation_rules>`). They take precedence over general best practices that may conflict with them.

Ensure your implementation accurately reflects the provided implementation plan (`<implementation_plan>`) and follows all specified rules. Pay special attention to correct definition and registration of tools, implementation of their logic, data and error handling, and compliance with MCP SDK specifics. Implement code iteratively according to `<implementation_approach>`.
