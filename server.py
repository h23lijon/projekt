from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/api/indicators')
def get_indicators():
    url = 'https://unstats.un.org/SDGAPI/v1/sdg/Indicator/List'
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
