"""
Vercel serverless function for generating random JSON structure with random data.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from datetime import datetime
import random
import string

# Add lib directory to path for Vercel
lib_path = os.path.join(os.path.dirname(__file__), '..', 'lib')
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from data_generator import DataGenerator


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
            
            options = body.get('options', {})
            
            # Get parameters
            depth = options.get('depth', 3)  # Maximum nesting depth
            max_keys = options.get('maxKeys', 5)  # Maximum keys per object
            max_items = options.get('maxItems', 5)  # Maximum items in arrays
            seed = options.get('seed')
            locale = options.get('locale', 'en_US')
            
            # Set seed if provided
            if seed is not None:
                try:
                    random.seed(int(seed))
                except (ValueError, TypeError):
                    pass
            
            # Initialize data generator
            generator = DataGenerator(locale=locale)
            if seed is not None:
                try:
                    generator.set_seed(int(seed))
                except (ValueError, TypeError):
                    pass
            
            # Generate random JSON structure
            result = self._generate_random_json(depth, max_keys, max_items, generator)
            
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
                    'itemCount': item_count,
                    'depth': depth,
                    'maxKeys': max_keys
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
    
    def _generate_random_json(self, depth, max_keys, max_items, generator):
        """Generate a random JSON structure."""
        if depth <= 0:
            # Leaf node - return a simple value
            return self._random_leaf_value(generator)
        
        structure_type = random.choice(['object', 'array', 'mixed'])
        
        if structure_type == 'array' or (structure_type == 'mixed' and random.random() < 0.3):
            # Generate array
            array_length = random.randint(1, max_items)
            return [
                self._generate_random_json(depth - 1, max_keys, max_items, generator)
                for _ in range(array_length)
            ]
        else:
            # Generate object
            num_keys = random.randint(1, max_keys)
            result = {}
            
            for _ in range(num_keys):
                key = self._random_key_name()
                # Avoid duplicate keys
                while key in result:
                    key = self._random_key_name()
                
                # Decide if this should be nested or leaf
                if depth > 1 and random.random() < 0.4:
                    result[key] = self._generate_random_json(depth - 1, max_keys, max_items, generator)
                else:
                    result[key] = self._random_leaf_value(generator)
            
            return result
    
    def _random_key_name(self):
        """Generate a random key name."""
        key_types = [
            lambda: ''.join(random.choices(string.ascii_lowercase, k=random.randint(3, 10))),
            lambda: f"{random.choice(['id', 'name', 'email', 'phone', 'address', 'city', 'country', 'date', 'time', 'status', 'type', 'value', 'count', 'price', 'amount'])}",
            lambda: f"{random.choice(['user', 'item', 'product', 'order', 'customer', 'product', 'category'])}{random.randint(1, 100)}",
        ]
        return random.choice(key_types)()
    
    def _random_leaf_value(self, generator):
        """Generate a random leaf value."""
        value_types = [
            lambda: generator.generate_string(),
            lambda: generator.generate_integer(),
            lambda: generator.generate_float(),
            lambda: generator.generate_boolean(),
            lambda: generator.generate_email(),
            lambda: generator.generate_phone(),
            lambda: generator.generate_date(),
            lambda: generator.generate_datetime(),
        ]
        return random.choice(value_types)()

