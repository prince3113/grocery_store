from sql_connection import get_sql_connection

def get_all_products(connection):

    cursor = connection.cursor()

    query = """
    SELECT
        p.product_id,
        p.name,
        p.uom_id,
        p.price_per_unit,
        p.category,
        u.uom_name
    FROM products p
    JOIN uom u
        ON p.uom_id = u.uom_id
    """

    cursor.execute(query)

    response = []

    for (
        product_id,
        name,
        uom_id,
        price_per_unit,
        category,
        uom_name
    ) in cursor:

        response.append({
            'product_id': product_id,
            'name': name,
            'uom_id': uom_id,
            'price_per_unit': price_per_unit,
            'category': category,
            'uom_name': uom_name
        })

    return response

def update_product(connection, product):

    cursor = connection.cursor()

    query = """
    UPDATE products
    SET
        name = %s,
        uom_id = %s,
        price_per_unit = %s,
        category = %s
    WHERE product_id = %s
    """

    data = (
        product['product_name'],
        product['uom_id'],
        product['price_per_unit'],
        product['category'],
        product['product_id']
    )

    cursor.execute(query, data)

    connection.commit()

    return cursor.rowcount

def insert_new_products(connection, product):

    cursor = connection.cursor()
    if product['price_per_unit'] <= 0:
        raise Exception("Invalid Price")
    query = """
    INSERT INTO products
    (name, uom_id, price_per_unit, category)
    VALUES (%s,%s,%s,%s)
    """

    data = (
        product['product_name'],
        product['uom_id'],
        product['price_per_unit'],
        product['category']
    )

    cursor.execute(query, data)

    connection.commit()

    cursor.execute("SELECT currval(pg_get_serial_sequence('products', 'product_id'))")
    product_id = cursor.fetchone()[0]
    return product_id

def delete_product(connection, product_id):

    cursor = connection.cursor()

    query = """
    DELETE FROM products
    WHERE product_id = %s
    """

    cursor.execute(query, (product_id,))

    connection.commit()

    return cursor.rowcount

if __name__ == '__main__':
    connection = get_sql_connection()

    print(get_all_products(connection))