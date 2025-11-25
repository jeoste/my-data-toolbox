"""
Vercel serverless function for validating XML structure.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import xml.etree.ElementTree as ET
from xml.parsers.expat import ExpatError
from datetime import datetime
from io import StringIO


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
            if 'xml' not in body:
                self._send_response(400, {
                    'success': False,
                    'error': 'Missing required field: xml'
                })
                return
            
            xml_content = body['xml']
            options = body.get('options', {})
            format_output = options.get('format', False)
            
            # Validate XML structure
            try:
                # Parse XML to check if it's well-formed
                root = ET.fromstring(xml_content)
                
                # Format XML if requested
                formatted_xml = None
                if format_output:
                    formatted_xml = self._format_xml(root)
                
                # Get XML structure info
                structure_info = self._get_structure_info(root)
                
                self._send_response(200, {
                    'success': True,
                    'isValid': True,
                    'formatted': formatted_xml,
                    'structure': structure_info,
                    'metadata': {
                        'validatedAt': datetime.now().isoformat()
                    }
                })
                
            except ExpatError as e:
                # XML parsing error
                error_info = {
                    'code': e.code,
                    'message': str(e),
                    'line': getattr(e, 'lineno', None),
                    'column': getattr(e, 'offset', None),
                }
                
                self._send_response(200, {
                    'success': True,
                    'isValid': False,
                    'error': error_info,
                    'metadata': {
                        'validatedAt': datetime.now().isoformat()
                    }
                })
                
            except ET.ParseError as e:
                # ElementTree parsing error
                error_info = {
                    'message': str(e),
                    'position': getattr(e, 'position', None),
                }
                
                self._send_response(200, {
                    'success': True,
                    'isValid': False,
                    'error': error_info,
                    'metadata': {
                        'validatedAt': datetime.now().isoformat()
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
    
    def _format_xml(self, element, level=0):
        """Format XML element with indentation."""
        indent = '  ' * level
        tag = element.tag
        text = element.text.strip() if element.text and element.text.strip() else ''
        tail = element.tail.strip() if element.tail and element.tail.strip() else ''
        
        # Build attributes string
        attrs = ''
        if element.attrib:
            attrs = ' ' + ' '.join(f'{k}="{v}"' for k, v in element.attrib.items())
        
        # If element has children or text
        if len(element) > 0 or text:
            result = f'{indent}<{tag}{attrs}>'
            if text:
                result += text
            if len(element) > 0:
                result += '\n'
                for child in element:
                    result += self._format_xml(child, level + 1) + '\n'
                result += indent
            result += f'</{tag}>'
        else:
            result = f'{indent}<{tag}{attrs} />'
        
        return result
    
    def _get_structure_info(self, element):
        """Get basic structure information about the XML."""
        info = {
            'rootTag': element.tag,
            'attributes': element.attrib,
            'childCount': len(element),
            'hasText': bool(element.text and element.text.strip()),
        }
        
        # Get unique child tags
        child_tags = {}
        for child in element:
            if child.tag not in child_tags:
                child_tags[child.tag] = 0
            child_tags[child.tag] += 1
        
        info['childTags'] = child_tags
        
        return info

