# Computer Vision Expert

## Overview

Use this skill to turn vague "make the model see better" requests into explicit computer-vision workflows with measurable inputs, outputs, and failure modes.
Prefer simple, testable pipelines and evidence-driven evaluation over fashionable models or premature complexity.

## Workflow

1. Define the exact vision task.
- Determine whether the task is classification, detection, segmentation, keypoints, tracking, OCR, retrieval, restoration, or measurement.
- Identify the input domain: still image, video, live camera, document scan, microscopy, satellite, industrial, or another domain.
- Define success in measurable terms such as accuracy, recall, latency, FPS, false positives, localization error, or downstream business impact.
- Read [`references/task_selection.md`](references/task_selection.md) when the request is underspecified or multiple CV framings are possible.

2. Choose the simplest viable pipeline.
- Start with a baseline that can be inspected and benchmarked.
- Separate data ingestion, preprocessing, inference, postprocessing, and evaluation.
- Prefer classical CV when the task is geometric, threshold-driven, template-based, or small-data.
- Prefer learned models when invariance, semantic understanding, or scale make heuristic pipelines brittle.
- Read [`references/pipeline_design.md`](references/pipeline_design.md) when choosing between classical CV, hybrid, and model-heavy approaches.
- Read the local OpenCV references when they match the task:
  [`references/Learning_OpenCV.txt`](references/Learning_OpenCV.txt) for broad OpenCV techniques and feature/matching workflows;
  [`references/OpenCV_Cookbook.txt`](references/OpenCV_Cookbook.txt) for practical implementation patterns;
  [`references/Video_Object_Tracking.txt`](references/Video_Object_Tracking.txt) for tracking-specific tasks, datasets, and methods.

3. Make data quality explicit.
- Check label quality, class balance, resolution, compression artifacts, lighting, occlusion, and domain shift.
- Treat poor annotations and mismatched evaluation data as first-order causes of failure.
- Do not blame the model first when the dataset is weak or misaligned.

4. Evaluate before optimizing.
- Establish a baseline metric and representative validation set.
- Inspect failures by category rather than averaging everything into one score.
- Measure speed, memory, and deployment constraints alongside accuracy.
- Read [`references/debugging_and_failure_analysis.md`](references/debugging_and_failure_analysis.md) when performance is unstable, errors cluster in strange ways, or the model seems to fail "randomly."

5. Improve iteratively.
- Change one major factor at a time: data, preprocessing, architecture, thresholding, postprocessing, or evaluation.
- Prefer targeted fixes tied to a known failure mode.
- Keep intermediate visualizations so behavior is explainable.

## Implementation defaults

- Use OpenCV for image I/O, geometry, filtering, thresholding, contour work, calibration, and fast visual debugging.
- Use PyTorch-based models when the task needs modern learned vision methods and the environment supports them.
- Save representative outputs with overlays, masks, boxes, or heatmaps so predictions can be inspected visually.
- For video, define frame sampling, buffering, temporal smoothing, and throughput requirements up front.
- For OCR, treat document cleanup, orientation, crop quality, and layout structure as part of the pipeline, not preprocessing trivia.
- If the work is OpenCV-heavy, check the local books before reinventing standard pipelines or utility patterns.

## Quality bar

- Favor measurable improvement over architecture churn.
- Favor robust pipelines over benchmark theater.
- Avoid changing data, model, thresholds, and evaluation all at once.
- Avoid shipping a CV system that has never been reviewed on hard negatives and edge cases.
- State what the model cannot do, not only what it can do.

## Output expectations

When using this skill, aim to produce:
- A clearly framed CV task with explicit inputs, outputs, and success metrics.
- A pipeline design that can be implemented and debugged in stages.
- Visual inspection artifacts for representative successes and failures.
- A short explanation of the main failure modes and the next best improvement step.
