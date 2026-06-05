import pymysql

def get_user_by_username(connection, username):
    cursor = connection.cursor(pymysql.cursors.DictCursor)
    query = "SELECT * FROM users WHERE username=%s"
    cursor.execute(query, (username,))
    return cursor.fetchone()

def insert_user(connection, username, password, role):
    cursor = connection.cursor()
    query = "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)"
    cursor.execute(query, (username, password, role))
    connection.commit()
    return cursor.lastrowid