from flask import Flask, request, jsonify
from sql_connection import get_sql_connection
import json


import products_dao

app = Flask(__name__)

connection = get_sql_connection()

@app.route('/get-products', methods=['GET'])

def get_product():
    products = products_dao.get_all_products(connection)
    response = jsonify(products)
    response.headers.add('Access-Control-Allow-Origin','*')
    return response

    

if __name__ == '__main__':
    print("Starting Python Flask Server For Grocery Store Management System")
    app.run(port=5000)