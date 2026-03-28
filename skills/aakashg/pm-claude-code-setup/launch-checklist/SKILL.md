# Launch Checklist

## Trigger
Activate on "launch checklist", "pre-launch check", "ready to launch?", "launch prep".

## Behavior

### Step 1: Get Context
Ask:
1. What are you launching?
2. Launch date
3. How many users affected?
4. Risk level (high/medium/low)

### Step 2: Generate Checklist

**Pre-Launch**
- [ ] Feature complete and QA'd
- [ ] Rollback plan documented and tested
- [ ] Success metrics defined with baselines
- [ ] Monitoring dashboards set up
- [ ] Support team briefed with FAQ
- [ ] Release notes drafted
- [ ] Feature flag configured (if gradual rollout)

**Launch Day**
- [ ] Deploy during low-traffic window
- [ ] Verify metrics are tracking
- [ ] Monitor error rates for 2 hours
- [ ] Send internal launch comms
- [ ] Publish release notes

**Post-Launch (48 hours)**
- [ ] Check primary metric vs baseline
- [ ] Check guardrail metrics
- [ ] Review support tickets for new issues
- [ ] Share initial results with team

**Post-Launch (1 week)**
- [ ] Full metrics review
- [ ] Ship or iterate decision
- [ ] Retrospective if needed

## Risk Scaling

Scale the checklist to risk level:

| Risk Level | When | What to Add |
|-----------|------|-------------|
| **Low** | Config change, copy update, small UI tweak | Minimal — deploy, monitor for 30 min, done |
| **Medium** | New feature behind flag, migration with rollback | Full checklist above. 2-hour monitoring window |
| **High** | Pricing change, auth flow, data migration, public-facing API | Everything above PLUS: staged rollout (1% → 10% → 50% → 100%), war room channel, exec notification, 24-hour monitoring |

## Example: Good vs Bad Launch Checklist Items

**Bad:** "Make sure everything works"
**Good:** "Verify signup flow completes end-to-end in staging (email → verification → first dashboard load). Test with Gmail, Outlook, and corporate SSO."

**Bad:** "Tell the team"
**Good:** "Post in #eng-launches: what shipped, who's on-call, rollback command, link to monitoring dashboard."

**Bad:** "Watch metrics"
**Good:** "Monitor error rate in Datadog for 2 hours post-deploy. Baseline: 0.3%. Alert threshold: 0.5%. Rollback threshold: 1.0%."

## Rules
- Higher risk = more checklist items. Scale accordingly.
- Every item needs an owner and a deadline. Not "soon" — a time.
- Never launch on Friday afternoons
- If rollback takes more than 5 minutes, add more testing time
- Every item must be verifiable. "Done" means someone can confirm it, not just feel it.
