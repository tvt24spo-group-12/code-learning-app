from flask import Flask, render_template_string, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

app = Flask(__name__)

# --- FIREBASE ALUSTUS ---
SDK_PATH = 'serviceAccountKey.json'

if os.path.exists(SDK_PATH):
    cred = credentials.Certificate(SDK_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    db = None

# --- HTML SIVU ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Firebase course lisäys hommeli</title>
    <style>
        body { padding: 40px; background: #ffffff; }
        .container { max-width: 600px; padding: 20px; background: #a2a2a2; }
        select, textarea, input { width: 100%; padding: 10px; margin: 10px 0;}
        button { width: 100%; padding: 12px; font-size: 16px; }
        .error { color: red; }
        .success { color: green; }
        
    </style>
</head>
<body>
    <div class="container">
        <h2>Kurssi editori</h2>
        <p class="info">Kokoelma: <b>Courses</b></p>
        
        {% if not linked %}
            <p class="error">Tiedostoa 'serviceAccountKey.json' ei ole lisää se samaan kansioon kuin app.py</p>
        {% else %}
            <form id="uploadForm">
                <label>kurssin valinta</label>
                <select id="docId" name="docId">
                    <option value="">valitse</option>
                    {% for doc in documents %}
                        <option value="{{ doc }}">{{ doc }}</option>
                    {% endfor %}
                </select>
                
                <p>Document ID:</p>
                <input type="text" id="newDocId" placeholder="Esim. kurssi-101">

                <label>JSON Data (asettaa dokumentin tiedot):</label>
                <textarea id="jsonData" rows="10" placeholder='{"title": "Matematiikka", "price": 50}'></textarea>
                
                <button type="submit">Lisää>
            </form>
            <div id="status"></div>
        {% endif %}
    </div>

    <script>
        document.getElementById('uploadForm').onsubmit = async (e) => {
            e.preventDefault();
            const status = document.getElementById('status');
            const docId = document.getElementById('newDocId').value || document.getElementById('docId').value;
            const data = document.getElementById('jsonData').value;

            if (!docId) {
                status.innerHTML = '<p class="error">Anna tai valitse Document ID!</p>';
                return;
            }
            const res = await fetch('/upload', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ docId: docId, data: data })
            });
            const result = await res.json();
            if (result.success) {
                status.innerHTML = '<p class="success">Valmis! Kurssi "' + docId + '" päivitetty.</p>';
                setTimeout(() => location.reload(), 1500);
            } else {
                status.innerHTML = '<p class="error">Virhe: ' + result.error + '</p>';
            }
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    if not db:
        return render_template_string(HTML_TEMPLATE, linked=False)
    docs = db.collection('Courses').stream()
    doc_ids = [d.id for d in docs]
    return render_template_string(HTML_TEMPLATE, linked=True, documents=doc_ids)

@app.route('/upload', methods=['POST'])
def upload():
    try:
        req_data = request.json
        doc_id = req_data.get('docId')
        raw_json = req_data.get('data')
        
        data = json.loads(raw_json)
        db.collection('Courses').document(doc_id).set(data)
            
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    print("http://127.0.0.1:5000")
    app.run(debug=True)
