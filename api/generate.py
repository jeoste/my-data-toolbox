"""
Vercel serverless function for generating JSON data from skeleton.
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

from data_generator import DataGenerator
from json_processor import JSONProcessor


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
            if 'skeleton' not in body:
                self._send_response(400, {
                    'success': False,
                    'error': 'Missing required field: skeleton'
                })
                return
            
            skeleton = body['skeleton']
            swagger_spec = body.get('swagger')
            options = body.get('options', {})
            
            # Initialize data generator
            locale = options.get('locale', 'en_US')
            generator = DataGenerator(locale=locale)
            
            # Set seed if provided
            if 'seed' in options:
                try:
                    generator.set_seed(int(options['seed']))
                except (ValueError, TypeError):
                    pass
            
            # Process JSON with processor
            processor = JSONProcessor()
            result = processor.process_json(skeleton, swagger_spec, generator)
            
            # Apply count override to top-level arrays if requested
            count = options.get('count')
            if count is not None:
                try:
                    count = int(count)
                    if isinstance(result, list) and len(result) > 0:
                        # Regenerate items to have unique data
                        result = [processor.process_json(skeleton, swagger_spec, generator) for _ in range(count)]
                    elif isinstance(result, dict):
                        def override_arrays(obj, target_count):
                            if isinstance(obj, list) and len(obj) > 0:
                                return [obj[0]] * target_count
                            if isinstance(obj, dict):
                                return {k: override_arrays(v, target_count) for k, v in obj.items()}
                            return obj
                        result = override_arrays(result, count)
                except (ValueError, TypeError):
                    pass
            
            # Determine item count
            item_count = 1
            if isinstance(result, list):
                item_count = len(result)
            elif isinstance(result, dict):
                for value in result.values():
                    if isinstance(value, list):
                        item_count = len(value)
                        break
            
            self._send_response(200, {
                'success': True,
                'data': result,
                'metadata': {
                    'generatedAt': datetime.now().isoformat(),
                    'itemCount': item_count
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
