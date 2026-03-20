# Spark Streaming

```python
df = spark.readStream.format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "events").load()

events = df.selectExpr("CAST(value AS STRING)") \
    .select(F.from_json(F.col("value"), schema).alias("d")).select("d.*")

# Windowed aggregation
windowed = events.withWatermark("ts", "10 min") \
    .groupBy(F.window("ts", "5 min"), "userId") \
    .agg(F.count("*").alias("cnt"))

query = windowed.writeStream.outputMode("update") \
    .format("console").start()
query.awaitTermination()
```

## Output modes: append, update, complete
## Triggers: processingTime, once, availableNow