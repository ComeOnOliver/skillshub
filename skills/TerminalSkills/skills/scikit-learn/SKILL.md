# scikit-learn

## Overview

Scikit-learn is a Python machine learning library that provides a consistent API for the full ML workflow: data preprocessing (scaling, encoding, imputation), model selection (classification, regression, clustering), hyperparameter tuning (grid search, randomized search), cross-validation, and pipeline construction. It supports serialization via joblib for production deployment.

## Instructions

- When preprocessing data, use `ColumnTransformer` to apply different transformers to numeric and categorical columns (StandardScaler, OneHotEncoder, SimpleImputer), always within a Pipeline to prevent data leakage.
- When choosing models, start with fast baselines (LogisticRegression, RandomForest) and use `HistGradientBoostingClassifier` for best tabular performance, since it handles missing values natively and is faster than GradientBoosting.
- When evaluating, use `cross_val_score` with 5-fold CV instead of single train/test splits, and use `classification_report()` instead of accuracy alone since accuracy is misleading on imbalanced datasets.
- When tuning hyperparameters, use `RandomizedSearchCV` when the search space exceeds 100 combinations (faster than exhaustive GridSearchCV), and use `StratifiedKFold` or `TimeSeriesSplit` as appropriate.
- When building pipelines, chain preprocessing and model steps with `Pipeline` to ensure transformers fit only on training data, then serialize the full pipeline with `joblib.dump()` for deployment.
- When selecting features, use `permutation_importance()` for model-agnostic measurement, `SelectKBest` for statistical filtering, or `feature_importances_` from tree-based models.

## Examples

### Example 1: Build a customer churn prediction pipeline

**User request:** "Create a model to predict which customers will churn"

**Actions:**
1. Build a `ColumnTransformer` with `StandardScaler` for numeric features and `OneHotEncoder` for categorical
2. Create a `Pipeline` with the transformer and `HistGradientBoostingClassifier`
3. Tune hyperparameters with `RandomizedSearchCV` using `StratifiedKFold`
4. Evaluate with `classification_report()` focusing on recall for the churn class

**Output:** A tuned churn prediction pipeline with preprocessing, model, and evaluation metrics.

### Example 2: Cluster customers into segments

**User request:** "Segment customers based on purchasing behavior"

**Actions:**
1. Preprocess features with `StandardScaler` in a pipeline
2. Use `KMeans` with silhouette score analysis to determine optimal cluster count
3. Run `PCA` for dimensionality reduction and visualization
4. Profile clusters with `groupby` on original features to interpret segments

**Output:** Customer segments with labeled profiles and a visual cluster map.

## Guidelines

- Always use `Pipeline` to prevent data leakage by fitting transformers only on training data.
- Use `ColumnTransformer` for mixed data types: numeric scaling and categorical encoding in one object.
- Use `HistGradientBoostingClassifier` over `GradientBoostingClassifier` since it is faster and handles missing values natively.
- Use `cross_val_score` with 5-fold CV rather than a single train/test split since single splits are noisy.
- Use `RandomizedSearchCV` when the search space exceeds 100 combinations.
- Use `classification_report()` not just accuracy, which is misleading on imbalanced datasets.
- Serialize the full pipeline with `joblib`, not just the model, since deployment needs preprocessing too.