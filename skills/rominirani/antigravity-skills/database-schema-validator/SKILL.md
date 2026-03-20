# Database Schema Validator Skill

This skill ensures that all SQL files provided by the user comply with our strict database standards.

## Policies Enforced
1. **Safety**: No `DROP TABLE` statements.
2. **Naming**: All tables must use `snake_case`.
3. **Structure**: Every table must have an `id` column as PRIMARY KEY.

## Instructions

1. **Do not read the file manually** to check for errors. The rules are complex and easily missed by eye.
2. **Run the Validation Script**:
   Use the `run_command` tool to execute the python script provided in the `scripts/` folder against the user's file.
   
   ```bash
   python scripts/validate_schema.py <path_to_user_file>
   ```

3. **Interpret Output**:
   - If the script returns **exit code 0**: Tell the user the schema looks good.
   - If the script returns **exit code 1**: Report the specific error messages printed by the script to the user and suggest fixes.