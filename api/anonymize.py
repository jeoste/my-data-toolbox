"""
Vercel serverless function for anonymizing JSON data.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from datetime import datetime

# Add lib directory to path for Vercel
lib_path = os.path.join(os.path.dirname(__file__), '..', 'lib')
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from data_anonymizer import DataAnonymizer


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length).decode('utf-8')
            
            try:
                body = json.loads(body_raw) if body_raw else {}
            except json.JSONDecodeError:
                self._send_response(400, {
                    'success': False,
                    'error': 'Invalid JSON in request body'
                })
                return
            
            # Validate required fields
            if 'data' not in body:
                self._send_response(400, {
                    'success': False,
                    'error': 'Missing required field: data'
                })
                return
            
            data_to_anonymize = body['data']
            options = body.get('options', {})
            
            # Initialize anonymizer
            locale = options.get('locale', 'en_US')
            anonymizer = DataAnonymizer(locale=locale)
            
            # Anonymize data
            result = anonymizer.anonymize_json(data_to_anonymize)
            
            self._send_response(200, {
                'success': True,
                'data': result,
                'metadata': {
                    'processedAt': datetime.now().isoformat()
                }
            })
            
        except Exception as e:
            self._send_response(500, {
                'success': False,
                'error': 'Internal server error',
                'details': str(e)
            })
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
