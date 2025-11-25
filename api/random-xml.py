"""
Vercel serverless function for generating random XML structure with random data.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import xml.etree.ElementTree as ET
from datetime import datetime
import random
import string


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
            max_children = options.get('maxChildren', 5)  # Maximum children per element
            max_items = options.get('maxItems', 5)  # Maximum items in repeated elements
            seed = options.get('seed')
            root_tag = options.get('rootTag', 'root')
            
            # Set seed if provided
            if seed is not None:
                try:
                    random.seed(int(seed))
                except (ValueError, TypeError):
                    pass
            
            # Generate random XML structure
            root = self._generate_random_xml(root_tag, depth, max_children, max_items)
            
            # Format XML
            formatted_xml = self._format_xml(root)
            
            # Determine item count
            item_count = len(list(root))
            
            self._send_response(200, {
                'success': True,
                'data': formatted_xml,
                'metadata': {
                    'generatedAt': datetime.now().isoformat(),
                    'itemCount': item_count,
                    'depth': depth,
                    'maxChildren': max_children
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
    
    def _generate_random_xml(self, tag_name, depth, max_children, max_items):
        """Generate a random XML element."""
        element = ET.Element(tag_name)
        
        # Add random attributes
        if random.random() < 0.5:
            num_attrs = random.randint(0, 3)
            attr_names = ['id', 'name', 'type', 'status', 'value', 'count', 'date']
            for _ in range(num_attrs):
                attr_name = random.choice(attr_names)
                if attr_name not in element.attrib:
                    element.attrib[attr_name] = self._random_attr_value(attr_name)
        
        if depth <= 0:
            # Leaf node - add text content
            element.text = self._random_text_value()
            return element
        
        # Add children
        if random.random() < 0.7:  # 70% chance to have children
            num_children = random.randint(1, max_children)
            
            # Decide if we should repeat the same tag or use different tags
            if random.random() < 0.4 and num_children > 1:
                # Repeat same tag
                child_tag = self._random_tag_name()
                for _ in range(min(num_children, max_items)):
                    child = self._generate_random_xml(child_tag, depth - 1, max_children, max_items)
                    element.append(child)
            else:
                # Different tags
                for _ in range(num_children):
                    child_tag = self._random_tag_name()
                    child = self._generate_random_xml(child_tag, depth - 1, max_children, max_items)
                    element.append(child)
        else:
            # Add text content to leaf
            element.text = self._random_text_value()
        
        return element
    
    def _random_tag_name(self):
        """Generate a random tag name."""
        tag_types = [
            lambda: ''.join(random.choices(string.ascii_lowercase, k=random.randint(3, 10))),
            lambda: random.choice(['item', 'element', 'node', 'entry', 'record', 'data', 'field', 'property', 'attribute', 'value', 'name', 'id', 'type', 'status', 'user', 'product', 'order', 'category']),
            lambda: f"{random.choice(['item', 'element', 'node'])}{random.randint(1, 100)}",
        ]
        return random.choice(tag_types)()
    
    def _random_attr_value(self, attr_name):
        """Generate a random attribute value based on attribute name."""
        if attr_name == 'id':
            return str(random.randint(1, 10000))
        elif attr_name == 'type':
            return random.choice(['string', 'number', 'boolean', 'date', 'object', 'array'])
        elif attr_name == 'status':
            return random.choice(['active', 'inactive', 'pending', 'completed', 'failed'])
        elif attr_name == 'date':
            year = random.randint(2020, 2024)
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            return f"{year}-{month:02d}-{day:02d}"
        else:
            return ''.join(random.choices(string.ascii_letters + string.digits, k=random.randint(3, 15)))
    
    def _random_text_value(self):
        """Generate a random text value."""
        value_types = [
            lambda: ''.join(random.choices(string.ascii_letters + string.digits + ' ', k=random.randint(5, 30))).strip(),
            lambda: str(random.randint(1, 1000)),
            lambda: f"{random.random() * 100:.2f}",
            lambda: random.choice(['true', 'false']),
            lambda: f"{random.randint(2020, 2024)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            lambda: f"user{random.randint(1, 1000)}@example.com",
            lambda: f"+33{random.randint(100000000, 999999999)}",
        ]
        return random.choice(value_types)()
    
    def _format_xml(self, element):
        """Format XML element with proper declaration."""
        xml_string = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_string += ET.tostring(element, encoding='unicode')
        return xml_string

