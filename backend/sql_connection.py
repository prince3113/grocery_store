import mysql.connector

def get_sql_connection():
    return mysql.connector.connect(
        user='root',
        password='root',
        host='127.0.0.1',
        database='grocery_store'
    )