# MCP Server Planning Summary

{{latest-round-answers}}

---

You are an AI assistant whose task is to summarize a conversation about planning an **MCP (Model Context Protocol) server** for an MVP and prepare a concise summary for the next development stage. In the conversation history, you will find the following information:

1.  Product Requirements Document (PRD)
2.  Information about the technology stack
3.  Conversation history containing questions and answers about **MCP server design (tools, resources, prompts, schemas, API, etc.)**
4.  Recommendations regarding **MCP server design**

Your tasks are:

1.  Summarize the conversation history, focusing on all decisions related to **MCP server planning**.
2.  Match the model''s recommendations to the answers provided in the conversation history. Identify which **MCP server** recommendations are relevant based on the discussion.
3.  Prepare a detailed conversation summary that includes:
    a. Main requirements for **MCP server functionality** (what tools/resources/prompts should it provide?)
    b. Key **tools/resources/prompts**, their **inputs/outputs**, **schemas**, and **data sources**.
    c. Important issues regarding **response structure, error handling, security**, and **interactions with SDK/framework**.
    d. Any unresolved issues or areas requiring further clarification regarding **MCP server implementation**.
4.  Format the results as follows:

<conversation_summary>
<decisions>
[List decisions made by the user regarding the MCP server, numbered].
</decisions>

<matched_recommendations>
[List of the most relevant MCP server recommendations matched to the conversation, numbered]
</matched_recommendations>

<mcp_server_planning_summary>
[Provide a detailed summary of the MCP server planning conversation, including the elements listed in step 3].
</mcp_server_planning_summary>

<unresolved_issues>
[List any unresolved issues or areas requiring further clarification regarding the MCP server, if any]
</unresolved_issues>
</conversation_summary>

The final output should contain only content in markdown format. Ensure that your summary is clear, concise, and provides valuable information for the next stage of **MCP server implementation**.
