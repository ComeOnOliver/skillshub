# License Header Adder Skill

This skill ensures that all new source files have the correct copyright header.

## Instructions

1. **Read the Template**:
   First, read the content of the header template file located at `resources/HEADER_TEMPLATE.txt`.
   
   ```python
   # Pseudocode for agent understanding
   template_content = view_file("resources/HEADER_TEMPLATE.txt")
   ```

2. **Prepend to File**:
   When creating a new file (e.g., `.py`, `.java`, `.js`, `.ts`, `.go`), prepend the `target_file` content with the template content.

3. **Modify Comment Syntax**:
   - For C-style languages (Java, JS, TS, C++), keep the `/* ... */` block as is.
   - For Python, Shell, or YAML, convert the block to use `#` comments.
   - For HTML/XML, use `<!-- ... -->`.

## Example Usage
If the user asks to "create a python script for hello world", you should generate:

```python
# Copyright (c) 2024 Google LLC
# ... (rest of license text) ...

def main():
    print("Hello World")
```
