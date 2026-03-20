# PySpark

## SparkSession
```python
from pyspark.sql import SparkSession, functions as F
spark = SparkSession.builder.appName("ETL").getOrCreate()
```

## DataFrames
```python
df = spark.read.parquet("s3://data/")
result = (df.filter(F.col("age") > 18)
    .groupBy("country")
    .agg(F.count("*").alias("cnt"), F.avg("age").alias("avg_age"))
    .orderBy(F.desc("cnt")))
result.write.parquet("output/", mode="overwrite", partitionBy=["country"])
```

## Window Functions
```python
from pyspark.sql.window import Window
w = Window.partitionBy("dept").orderBy(F.desc("salary"))
df.withColumn("rank", F.row_number().over(w))
```

## Pandas UDF (10-100x faster than regular UDF)
```python
@pandas_udf(StringType())
def categorize(ages: pd.Series) -> pd.Series:
    return ages.apply(lambda a: "minor" if a < 18 else "adult")
```