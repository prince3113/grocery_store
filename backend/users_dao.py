import pymysql

def get_user_by_username(connection, username):
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    query = "SELECT * FROM users WHERE username=%s"
    cursor.execute(query, (username,))

    return cursor.fetchone()