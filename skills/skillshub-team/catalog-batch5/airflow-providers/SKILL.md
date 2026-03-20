# Airflow Providers

## AWS
```python
from airflow.providers.amazon.aws.transfers.s3_to_redshift import S3ToRedshiftOperator
S3ToRedshiftOperator(task_id='load', s3_bucket='data', s3_key='{{ ds }}.csv',
    schema='public', table='users', redshift_conn_id='redshift')
```

## GCP BigQuery
```python
BigQueryInsertJobOperator(task_id='query', configuration={'query': {
    'query': 'SELECT * FROM dataset.table', 'useLegacySql': False }})
```

## Docker
```python
DockerOperator(task_id='etl', image='my-etl:latest', command='python run.py --date {{ ds }}')
```

## Dynamic Task Mapping
```python
@task
def get_files() -> list[str]: return ['a.csv', 'b.csv']
@task
def process(f: str): ...
process.expand(f=get_files())
```