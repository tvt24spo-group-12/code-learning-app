from flask import Flask, render_template_string, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

app = Flask(__name__)

# FIREBASE ALUSTUS, latasin tuon service accountin vaikka ei ois hyvä tapa
# välillä herjaa koodi että tiedostoa ei löydy restartti auttaa
SDK_PATH = 'serviceAccountKey.json'

if os.path.exists(SDK_PATH):
    cred = credentials.Certificate(SDK_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    db = None

# HTML SIVU, simppeli käyttöliittymä
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
    
            //pieni testi jos ei löydä tuota service accounttia niin näkee että se on ongelma eikä näy tyhjää sivua ja päivitykset menee hukkaa
        {% if not linked %}
            <p class="error">Tiedostoa 'serviceAccountKey.json' ei ole lisää se samaan kansioon kuin app.py</p>
        {% else %}
            <form id="uploadForm">
                <label>Kurssin valinta (Document ID):</label>
                <select id="docId" name="docId">
                    <option value="">valitse</option>
                    {% for doc in documents %}
                        <option value="{{ doc }}">{{ doc }}</option>
                    {% endfor %}
                </select>

                <p>Manuaalinen valinta:</p>
                <input type="text" id="newDocId" placeholder="Esim. Python nönnönönnö">
                <p><b>Tehtävän tiedot (vapaaehtoinen):</b></p>
                <label>Alikokoelma (esim. tasks):</label>
                <input type="text" id="subCol" placeholder="tasks">
                
                <label>Tehtävän ID:</label>
                <input type="text" id="taskId" placeholder="tehtava-1">

                <label>JSON Data:</label>
                <textarea id="jsonData" rows="10" placeholder='{"title": "Esimerkki"}'></textarea>
                
                <button type="submit">Lisää / Päivitä</button>
            </form>
            <div id="status"></div>
        {% endif %}
    </div>

    <script>
        document.getElementById('uploadForm').onsubmit = async (e) => {
            e.preventDefault();
            const status = document.getElementById('status');
            status.innerText = "Käsitellään...";
            
            const docId = document.getElementById('newDocId').value || document.getElementById('docId').value;
            const subCol = document.getElementById('subCol').value.trim();
            const taskId = document.getElementById('taskId').value.trim();
            const data = document.getElementById('jsonData').value;

            if (!docId) {
                status.innerHTML = '<p class="error">Anna tai valitse Kurssi ID!</p>';
                return;
            }

            const res = await fetch('/upload', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    docId: docId, 
                    subCol: subCol, 
                    taskId: taskId, 
                    data: data 
                })
            });
            const result = await res.json();
            if (result.success) {
                status.innerHTML = '<p class="success">Valmis! Tallennettu.</p>';
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
        sub_col = req_data.get('subCol')
        task_id = req_data.get('taskId')
        raw_json = req_data.get('data')
        
        data = json.loads(raw_json)
        doc_ref = db.collection('Courses').document(doc_id)

        #firebase valittaa että pitää olla jotakin documentin sisällä muutakin kuin toinen collectioni niin laitoin tuo courseid sinne sisälle.
        doc_ref.set({"courseId": doc_id}, merge=True)
    
        if sub_col and task_id:
            doc_ref.collection(sub_col).document(task_id).set(data)
        elif sub_col:
            doc_ref.collection(sub_col).add(data)
        else:
            doc_ref.set(data, merge=True)
            
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
if __name__ == '__main__':
    print("http://127.0.0.1:5000")
    app.run(debug=True)
