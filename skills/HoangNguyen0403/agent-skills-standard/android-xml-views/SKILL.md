# Android XML Views Standards

## **Priority: P1**

## Implementation Guidelines

### ViewBinding

- **Standard**: Use ViewBinding for all XML layouts.
- **Synthetics**: `kotlin-android-extensions` is Dead. Remove it.
- **KAPT**: Avoid DataBinding unless strictly necessary (impacts build speed).

### RecyclerView

- **Adapter**: Always inherit `ListAdapter` (wraps AsyncListDiffer).
- **Updates**: Provide a proper `DiffUtil.ItemCallback`. NEVER call `notifyDataSetChanged()`.

### Layouts

- **ConstraintLayout**: Use for complex flat hierarchies.
- **Performance**: Avoid deep nesting (LinearLayout inside LinearLayout).

## Anti-Patterns

- **findViewById**: `**Deprecated**: Use ViewBinding.`
- **Synthetics**: `**Deprecated**: Remove import kotlinx.android.synthetic.*.`

## References

- [ViewBinding & Adapter](references/implementation.md)