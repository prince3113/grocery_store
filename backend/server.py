from flask import Flask, request, jsonify
from flask_cors import CORS
from sql_connection import get_sql_connection
import json
import products_dao
import order_dao
import uom_dao
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
import users_dao

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "grocery_store_secret_key"

jwt = JWTManager(app)

@app.route('/dashboardStats', methods=['GET'])
def dashboard_stats():

    connection = get_sql_connection()

    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(total) FROM orders")
    total_revenue = cursor.fetchone()[0]

    return jsonify({
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue or 0
    })


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

@app.route('/insertProduct', methods=['POST'])
@jwt_required()
def insert_product():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    connection = get_sql_connection()

    request_payload = request.get_json()

    product_id = products_dao.insert_new_products(
        connection,
        request_payload
    )

    response = jsonify({
        'product_id': product_id
    })

    response.headers.add(
        'Access-Control-Allow-Origin',
        '*'
    )

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
@jwt_required()
def delete_product():
    current_user = get_jwt()

    if current_user["role"] != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403
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

@app.route('/updateProduct', methods=['POST'])
@jwt_required()
def update_product():
    current_user = get_jwt()

    if current_user["role"] != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403
    connection = get_sql_connection()

    request_payload = request.get_json()

    updated_count = products_dao.update_product(
        connection,
        request_payload
    )

    return jsonify({
        "updated": updated_count
    })

@app.route('/login', methods=['POST'])
def login():

    connection = get_sql_connection()

    data = request.get_json()

    username = data['username']
    password = data['password']

    user = users_dao.get_user_by_username(
        connection,
        username
    )

    if not user:
        return jsonify({
            "message": "Invalid username"
        }), 401

    if password != user['password']:
        return jsonify({
            "message": "Invalid password"
        }), 401

    token = create_access_token(
    identity=str(user["user_id"]),
    additional_claims={
        "role": user["role"]
    }
)

    return jsonify({
        "token": token,
        "role": user["role"],
        "username": user["username"]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)