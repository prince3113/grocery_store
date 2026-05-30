from flask import Flask, request, jsonify
from flask_cors import CORS
from sql_connection import get_sql_connection
import json
import products_dao
import order_dao
import uom_dao

app = Flask(__name__)
CORS(app)

@app.route('/getProducts', methods=['GET'])
def get_product():
    connection = get_sql_connection()

    products = products_dao.get_all_products(connection)

    response = jsonify(products)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getUOM', methods=['GET'])
def get_uom():
    connection = get_sql_connection()

    cursor = connection.cursor()

    query = "SELECT * FROM uom"

    cursor.execute(query)

    response = []

    for (uom_id, uom_name) in cursor:
        response.append({
            'uom_id': uom_id,
            'uom_name': uom_name
        })

    return jsonify(response)

@app.route('/getAllorders',methods =['GET'])
def get_all_orders():
    connection = get_sql_connection()
    response = order_dao.get_all_orders(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin','*')
    return response

@app.route('/insertProduct',methods=['POST'])
def insert_product():

    connection = get_sql_connection()

    request_payload = request.get_json()

    products_id = products_dao.insert_new_products(
        connection,
        request_payload
    )

    response = jsonify({
        'product_id': products_id
    })

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response
@app.route('/insertOrder', methods=['POST'])
def insert_order():

    connection = get_sql_connection()

    request_payload = request.get_json()

    order_id = order_dao.insert_order(
        connection,
        request_payload
    )

    response = jsonify({
        'order_id': order_id
    })

    response.headers.add(
        'Access-Control-Allow-Origin',
        '*'
    )

    return response
@app.route('/deleteProduct', methods=['POST'])
def delete_product():

    connection = get_sql_connection()

    data = request.get_json()

    product_id = data['product_id']

    deleted_count = products_dao.delete_product(
        connection,
        product_id
    )

    return jsonify({
        "deleted": deleted_count
    })

if __name__ == '__main__':
    print("Starting Python Flask Server For Grocery Store Management System")
    app.run(port=5000)