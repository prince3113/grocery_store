import mysql.connector

def get_sql_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="root",
        database="grocery_store"
    )