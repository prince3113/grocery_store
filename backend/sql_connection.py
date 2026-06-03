import psycopg2

def get_sql_connection():
    return psycopg2.connect(
        host="YOUR_HOST",
        database="YOUR_DATABASE",
        user="YOUR_USERNAME",
        password="YOUR_PASSWORD",
        sslmode="require"
    )