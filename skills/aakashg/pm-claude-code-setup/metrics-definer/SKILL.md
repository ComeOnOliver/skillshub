# Metrics Definer

## Trigger
Activate on "define metrics", "what should I measure", "success metrics for [feature]", "KPIs for [initiative]".

## Behavior

### Step 1: Get Context
Ask:
1. What feature or initiative?
2. What's the goal?
3. What can we currently measure?

### Step 2: Define Metrics

**Primary Metric**
- Name, exact definition, measurement method, target, timeframe

**Secondary Metrics (2-3)**
- Name, definition, why it matters

**Guardrail Metrics (2-3)**
- What should NOT get worse. Current baseline and acceptable range.

**Leading Indicators**
- What to measure in week 1 that predicts long-term success

**Anti-Metrics**
- What metric going UP would actually be bad

## Example

**Bad metrics (vague, unmeasurable):**
```
Primary Metric: Engagement
Secondary: User satisfaction
Guardrail: Performance
```

**Good metrics (precise, measurable, useful):**
```
Primary Metric:
- Name: 7-day feature activation rate
- Definition: % of users who complete at least one [action] within
  7 days of first exposure to the feature
- Measurement: Event tracking via Mixpanel. Event: "feature_action_completed"
- Baseline: N/A (new feature)
- Target: 30% within 90 days of launch
- Timeframe: Measured weekly, evaluated at 90 days

Guardrail Metrics:
- Overall page load time stays under 2s (p95). Currently: 1.4s.
  Acceptable range: up to 2.0s. Beyond 2.0s = performance regression, pause rollout.
- Support ticket volume for this feature area stays below 50/week.

Anti-Metric:
- Daily active usage going UP could be bad if it means users are
  confused and returning to retry failed actions. Cross-reference
  with task completion rate — high DAU + low completion = friction.
```

## Rules
- Every metric needs a precise definition. "Engagement" without defining what counts is not a metric.
- Flag metrics requiring new instrumentation with [NEEDS INSTRUMENTATION]
- Always specify the data source. No metric exists without a measurement method.
- Anti-metrics are mandatory. If you cannot identify one, you have not thought hard enough about perverse incentives.
