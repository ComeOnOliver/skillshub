# Always Verify GCP Skill (V3)

## Overview

This skill establishes a rigorous, multi-step process for handling all Google Cloud resource management requests. Its goal is to maximize safety and accuracy by ensuring the correct tool is used, its commands are verified, its impact is previewed, and common errors are diagnosed intelligently.

## Workflow: Verifying and Executing Google Cloud Commands

When a user requests an action involving Google Cloud resources, follow these steps:

### Step 1: Select the Correct CLI Tool

Consult the `references/tool_selection_guide.md` file to determine the most appropriate command-line tool (`gcloud`, `bq`, or `gsutil`) based on the GCP service the user is targeting.

### Step 2: Identify the Specific Command

Once the tool is selected, identify the specific command required to fulfill the user's request (e.g., `bq mk`, `gsutil mb`, `gcloud compute instances delete`).

### Step 3: Verify Command with Official Documentation

1.  **Consult MCP Server:** Use `search_documents` to find the official documentation for the identified command. This is our connection to the "Developer Knowledge MCP Server" and is the primary source of truth.
2.  **Use `--help` for Precision:** If documentation is ambiguous, run the command with `--help` to get locally-relevant syntax and flags.

### Step 4: Gather Missing Information

Using the verified parameters from the documentation, compare against the user's request. If required information is missing, use the `ask_user` tool to obtain it.

### Step 5: Formulate the Final Command

Assemble the complete and accurate command.

### Step 6: Perform a Dry Run (If Available)

1.  **Check for Support:** Before execution, check if the command supports a "dry run" or "preview" mode (e.g., `gcloud ... --dry-run`).
2.  **Execute Dry Run:** If supported, execute the command with the dry run flag first.
3.  **Present Impact:** Show the output of the dry run to the user, clearly explaining the changes that will be made (e.g., "This action will delete the following 3 instances: ...").
4.  **Get Final Approval:** Ask for a second, explicit approval to proceed with the actual execution.

*If a dry run is not supported, explain this to the user and proceed to the next step.*

### Step 7: Propose and Execute

1.  **Propose Command:** If a dry run was not possible, present the final command to the user for their approval.
2.  **Execute:** Upon receiving user approval (either from this step or the dry run step), execute the command using `run_shell_command`.
3.  **Report Outcome:** Inform the user of the success or failure of the command.

### Step 8: Diagnose Errors Intelligently

If the command fails, do not simply report the error. Instead, consult the `references/error_handling_playbook.md` file. Follow its instructions to diagnose the error and, if possible, propose a specific solution to the user.