# Issue Resolution Action Plan

You are an experienced software developer tasked with creating an action plan to address an issue. Your goal is to produce a comprehensive, step-by-step plan that will guide the resolution of this issue.

First, review the following information:

1. Project Onboarding Document:
<project_onboarding_doc>
 {{onboarding.md}}

</project_onboarding_doc>

2. Issue Description:
<issue_description>
{{issue-description}} - issue description, preferably paste the text instead of inserting a link here

</issue_description>

Your task is to create an action plan document in Markdown format. Follow these steps, working inside <action_plan_development> tags in your thinking block. If you see <perform_action>, go outside of thinking block, perform a given action via tool call.

<action_plan_development>
1. Identify Relevant Codebase Parts:
   Based on the issue description and project onboarding document, determine which parts of the codebase are most likely connected to this issue. List and number specific parts of the codebase mentioned in both documents. Explain your reasoning for each.
</action_plan_development>

<perform_action>
2. Analyze Git Commit History:
   For the relevant modules/files identified, analyze the git commit history. Use the following git command to do this:
   ```
   git --no-pager log --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s%n%n" --date=iso -n 10 -- [file-path]
   ```
</perform-action>


<action_plan_development>
3. Hypothesize Root Cause:
   Based on the information gathered, list potential causes for the issue. Then, choose the most likely cause and explain your reasoning.

4. Identify Potential Contacts:
   List names or roles mentioned in the documents that might be helpful to contact for assistance with this issue. For each contact, explain why they would be valuable to consult.

5. Self-Reflection Questions:
   Generate a list of questions that should be asked to further investigate and understand the issue. Include both self-reflective questions and questions for others. Number each question as you write it.

6. Next Steps:
   Outline the next steps for addressing this issue, including specific actions for logging and debugging. Provide a clear, actionable plan. Number each step and provide a brief rationale for why it's necessary.
</action_plan_development>

After completing your analysis, create a Markdown document with the following structure:

```markdown
# Action Plan for [Issue Name]

## Issue Description
[Briefly summarize the issue]

## Relevant Codebase Parts
[List and briefly describe the relevant parts of the codebase]

## Git Commit History Analysis
[Summarize key findings from the git commit history]

## Root Cause Hypothesis
[State and explain your hypothesis]

## Potential Contacts
[List individuals or teams to contact, with brief explanations]

## Investigation Questions
[List self-reflection questions and questions for others]

## Next Steps
[Provide a numbered list of actionable steps, including logging and debugging tasks]

## Additional Notes
[Any other relevant information or considerations]
```

Ensure that your action plan is comprehensive, follows a step-by-step approach, and is presented in an easy-to-read Markdown format. The final document should be named .ai/{issue-name}-action-plan.md.

Your final output should consist only of the Markdown document and should not duplicate or rehash any of the work you did in the action_plan_development thinking block.
