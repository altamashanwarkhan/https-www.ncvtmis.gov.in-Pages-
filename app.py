from flask import Flask, render_template, request, jsonify, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import secrets
import qrcode
from io import BytesIO
import base64

app = Flask(__name__, static_folder='.', template_folder='.')
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', secrets.token_hex(16))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///certificates.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

class Certificate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    certificate_id = db.Column(db.String(50), unique=True, nullable=False)
    student_name = db.Column(db.String(200), nullable=False)
    course_name = db.Column(db.String(200), nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='valid')

    def to_dict(self):
        return {
            'id': self.certificate_id,
            'studentName': self.student_name,
            'courseName': self.course_name,
            'issueDate': self.issue_date.isoformat(),
            'createdAt': self.created_at.isoformat(),
            'status': self.status
        }

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    password = data.get('password')
    
    if password == ADMIN_PASSWORD:
        session['admin_authenticated'] = True
        session['auth_timestamp'] = datetime.utcnow().timestamp()
        session.modified = True
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Invalid password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if 'admin_authenticated' not in session:
        return jsonify({'authenticated': False})
    
    auth_time = session.get('auth_timestamp', 0)
    current_time = datetime.utcnow().timestamp()
    
    if (current_time - auth_time) > 3600:
        session.clear()
        return jsonify({'authenticated': False})
    
    return jsonify({'authenticated': True})

def check_admin_session():
    if 'admin_authenticated' not in session:
        return False
    
    auth_time = session.get('auth_timestamp', 0)
    current_time = datetime.utcnow().timestamp()
    
    if (current_time - auth_time) > 3600:
        session.clear()
        return False
    
    return True

@app.route('/api/certificates', methods=['GET'])
def get_certificates():
    if not check_admin_session():
        return jsonify({'error': 'Unauthorized'}), 401
    
    certificates = Certificate.query.order_by(Certificate.created_at.desc()).all()
    return jsonify([cert.to_dict() for cert in certificates])

@app.route('/api/certificates', methods=['POST'])
def create_certificate():
    if not check_admin_session():
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    
    timestamp = int(datetime.utcnow().timestamp())
    random = secrets.randbelow(1000000)
    certificate_id = f"AK-CERT-{timestamp}{random}"[:20]
    
    certificate = Certificate(
        certificate_id=certificate_id,
        student_name=data['studentName'],
        course_name=data['courseName'],
        issue_date=datetime.fromisoformat(data['issueDate']).date()
    )
    
    db.session.add(certificate)
    db.session.commit()
    
    return jsonify(certificate.to_dict()), 201

@app.route('/api/certificates/<certificate_id>', methods=['GET'])
def get_certificate(certificate_id):
    certificate = Certificate.query.filter_by(certificate_id=certificate_id.upper()).first()
    
    if not certificate:
        return jsonify({'error': 'Certificate not found'}), 404
    
    return jsonify(certificate.to_dict())

@app.route('/api/certificates/<int:id>', methods=['DELETE'])
def delete_certificate(id):
    if not check_admin_session():
        return jsonify({'error': 'Unauthorized'}), 401
    
    certificate = Certificate.query.get_or_404(id)
    db.session.delete(certificate)
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/qrcode/<certificate_id>')
def generate_qr(certificate_id):
    verify_url = request.host_url + 'verify.html'
    
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(verify_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#004e89", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return jsonify({'qr_code': f'data:image/png;base64,{img_str}'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
