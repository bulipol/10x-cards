# MCP Server Planning

You are an AI assistant whose task is to help plan the tools, resources, prompts, and overall structure of an MCP (Model Context Protocol) server for an MCP server MVP (Minimum Viable Product) based on the provided information. Your goal is to generate a list of questions and recommendations that will be used in subsequent prompting to implement the MCP server, its tools, and logic.

Please carefully review the following information:


<tech_stack>
{{tech-stack}}

</tech_stack>

Analyze the provided information, focusing on aspects relevant to MCP server design. Consider the following issues:

1.  Identify key tools (Tools), resources (Resources), and/or prompts (Prompts) required by the product. What specific functionalities should the server provide?
2.  Specify inputs and outputs for each identified tool/resource/prompt. What data is needed for their execution and what should they return?
3.  Consider the need for and method of defining schemas for input and output data validation (e.g., using the Zod library, as in our project).
4.  Think about data sources needed for the tools – where will information be retrieved from (e.g., static JSON files like `preparedRules.json`, external APIs, databases)?
5.  Assess security requirements and MCP server authentication. Should access to tools be restricted? (Our current example is without authentication).
6.  Consider any specific features of the chosen MCP framework/SDK (e.g., `@modelcontextprotocol/sdk/server/mcp.js`) and deployment environment (e.g., Cloudflare Workers) that may affect the design or implementation.
7.  Think about the required response structure from tools to be compatible with MCP clients and the SDK being used (e.g., is it necessary to wrap the result in `{ content: [...] }`?).
8.  Consider the error handling strategy – how will tool execution errors or data validation errors be communicated to the client?

Based on the analysis, generate a list of questions and recommendations. These should address any ambiguities, potential issues, or areas where more information is needed to effectively design and implement the MCP server. Consider questions regarding:

1.  Implementation details of individual tools/resources/prompts.
2.  Exact format and schemas of input/output data.
3.  Method of interaction with data sources.
4.  Expected response structure for the MCP client (e.g., content field contents).
5.  Authentication and authorization requirements (if applicable).
6.  Detailed error handling and message format.
7.  Testing strategy for the server and its tools (e.g., using tools such as `npx @modelcontextprotocol/inspector@latest`).
8.  Scalability and performance issues (e.g., handling long-running tools, caching).
9.  Need for state management on the server side (if required).

The output should have the following structure:

<mcp_server_planning_output>

<pytania>

[List your questions here, numbered]

</pytania>

<rekomendacje>

[List your recommendations here, numbered]

</rekomendacje>

</mcp_server_planning_output>

Remember that your goal is to provide a comprehensive list of questions and recommendations that will help create a solid and functional MCP server for the MVP. Focus on clarity, relevance, and accuracy of your results. Do not include any additional comments or explanations beyond the specified output format.

Continue this process, generating new questions and recommendations based on the provided context and user responses, until the user explicitly requests a summary.
