# Airflow DAGs

## TaskFlow API
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule='@daily', start_date=datetime(2024, 1, 1), catchup=False)
def etl():
    @task()
    def extract() -> dict: return fetch_data()

    @task()
    def transform(data: dict) -> dict: return clean(data)

    @task()
    def load(data: dict): write_to_db(data)

    load(transform(extract()))
etl()
```

## Classic DAG
```python
with DAG('pipeline', schedule='0 6 * * *', default_args={'retries': 2}) as dag:
    t1 = PythonOperator(task_id='extract', python_callable=extract)
    t2 = BashOperator(task_id='transform', bash_command='python transform.py')
    t1 >> t2
```

## Sensors: FileSensor, HttpSensor — wait for conditions
## XCom: ti.xcom_push(key='count', value=42) / ti.xcom_pull(task_ids='extract')
## CLI: airflow dags trigger / airflow tasks test
