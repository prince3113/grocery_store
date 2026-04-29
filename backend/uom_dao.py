from sql_connection import get_sql_connection
def get_uoms(conncetion):
    cursor = conncetion.cursor()
    query = ("select * from uom")
    cursor.execute(query)
    response = []
    for (uom_id, uom_name) in cursor:
        response.append({
            'uom_id':uom_id,
            'uom_nmae':uom_name
        })
    return response

if __name__ == '__main__':
    connection = get_sql_connection()
    print(get_uoms(connection))