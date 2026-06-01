def get_user_by_username(connection, username):
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT *
    FROM users
    WHERE username = %s
    """

    cursor.execute(query, (username,))
    return cursor.fetchone()