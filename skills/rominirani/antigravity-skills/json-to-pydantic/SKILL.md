# JSON to Pydantic Skill

This skill helps convert raw JSON data or API responses into structured, strongly-typed Python classes using Pydantic.

## Instructions

1. **Analyze the Input**: Look at the JSON object provided by the user.
2. **Infer Types**:
   - `string` -> `str`
   - `number` -> `int` or `float`
   - `boolean` -> `bool`
   - `array` -> `List[Type]`
   - `null` -> `Optional[Type]`
   - Nested Objects -> Create a separate sub-class.
   
3. **Follow the Example**:
   Review `examples/` to see how to structure the output code. notice how nested dictionaries like `preferences` are extracted into their own class.
   
   - Input: `examples/input_data.json`
   - Output: `examples/output_model.py`

## Style Guidelines
- Use `PascalCase` for class names.
- Use type hints (`List`, `Optional`) from `typing` module.
- If a field can be missing or null, default it to `None`.