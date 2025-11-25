"""
Vercel serverless function for generating XML data from skeleton.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import xml.etree.ElementTree as ET
from xml.parsers.expat import ExpatError
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
            
            # Validate required fields
            if 'skeleton' not in body:
                self._send_response(400, {
                    'success': False,
                    'error': 'Missing required field: skeleton'
                })
                return
            
            skeleton_xml = body['skeleton']
            options = body.get('options', {})
            
            # Set seed if provided
            if 'seed' in options:
                try:
                    random.seed(int(options['seed']))
                except (ValueError, TypeError):
                    pass
            
            # Parse skeleton XML
            try:
                root = ET.fromstring(skeleton_xml)
            except ExpatError as e:
                self._send_response(400, {
                    'success': False,
                    'error': 'Invalid XML skeleton',
                    'details': str(e)
                })
                return
            
            # Generate XML data
            generated_root = self._generate_xml_data(root, options.get('count', 1))
            
            # Format XML
            formatted_xml = self._format_xml(generated_root)
            
            # Determine item count
            item_count = 1
            if isinstance(generated_root, list):
                item_count = len(generated_root)
            elif len(generated_root) > 0:
                # Count direct children
                item_count = len(list(generated_root))
            
            self._send_response(200, {
                'success': True,
                'data': formatted_xml,
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
    
    def _generate_xml_data(self, element, count=1):
        """Generate XML data from skeleton element."""
        if count > 1 and element.tag:
            # Generate multiple instances
            results = []
            for _ in range(count):
                new_elem = self._clone_and_fill_element(element)
                results.append(new_elem)
            return results
        
        return self._clone_and_fill_element(element)
    
    def _clone_and_fill_element(self, element):
        """Clone element and fill with generated data."""
        new_elem = ET.Element(element.tag, element.attrib)
        
        # Fill text content
        if element.text and element.text.strip():
            new_elem.text = self._generate_value(element.text.strip())
        
        # Process children
        for child in element:
            new_child = self._clone_and_fill_element(child)
            new_elem.append(new_child)
        
        # Fill tail
        if element.tail and element.tail.strip():
            new_elem.tail = element.tail
        
        return new_elem
    
    def _generate_value(self, template):
        """Generate a value based on template patterns."""
        # Simple pattern matching for common data types
        template_lower = template.lower()
        
        if 'name' in template_lower or 'nom' in template_lower:
            return self._random_name()
        elif 'email' in template_lower or 'mail' in template_lower:
            return self._random_email()
        elif 'phone' in template_lower or 'tel' in template_lower:
            return self._random_phone()
        elif 'id' in template_lower:
            return str(random.randint(1, 10000))
        elif 'age' in template_lower:
            return str(random.randint(18, 80))
        elif 'date' in template_lower:
            return self._random_date()
        elif template.isdigit():
            # If template is a number, generate a similar number
            return str(random.randint(1, int(template) * 2))
        else:
            # Generate random string
            return self._random_string()
    
    def _random_name(self):
        first_names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
        return f"{random.choice(first_names)} {random.choice(last_names)}"
    
    def _random_email(self):
        domains = ['example.com', 'test.com', 'demo.org', 'sample.net']
        username = ''.join(random.choices(string.ascii_lowercase, k=8))
        return f"{username}@{random.choice(domains)}"
    
    def _random_phone(self):
        return f"+33{random.randint(100000000, 999999999)}"
    
    def _random_date(self):
        year = random.randint(2020, 2024)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        return f"{year}-{month:02d}-{day:02d}"
    
    def _random_string(self, length=10):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    
    def _format_xml(self, element):
        """Format XML element with proper indentation."""
        if isinstance(element, list):
            # Multiple root elements
            xml_parts = []
            for elem in element:
                xml_parts.append(ET.tostring(elem, encoding='unicode'))
            return '\n'.join(xml_parts)
        else:
            return ET.tostring(element, encoding='unicode')

