"""
Vercel serverless function for evaluating XPath expressions on XML.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import xml.etree.ElementTree as ET
from xml.parsers.expat import ExpatError
from datetime import datetime


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
            
            if 'xpath' not in body:
                self._send_response(400, {
                    'success': False,
                    'error': 'Missing required field: xpath'
                })
                return
            
            xml_content = body['xml']
            xpath_expr = body['xpath']
            options = body.get('options', {})
            return_format = options.get('format', 'json')  # 'json' or 'xml'
            
            # Parse XML
            try:
                root = ET.fromstring(xml_content)
            except ExpatError as e:
                self._send_response(400, {
                    'success': False,
                    'error': 'Invalid XML',
                    'details': str(e)
                })
                return
            except ET.ParseError as e:
                self._send_response(400, {
                    'success': False,
                    'error': 'XML parsing error',
                    'details': str(e)
                })
                return
            
            # Evaluate XPath expression
            try:
                # ElementTree supports basic XPath via findall()
                # For full XPath support, lxml would be needed
                results = self._evaluate_xpath(root, xpath_expr)
                
                # Format results based on requested format
                if return_format == 'xml':
                    formatted_results = self._format_results_as_xml(results)
                else:
                    formatted_results = self._format_results_as_json(results)
                
                self._send_response(200, {
                    'success': True,
                    'results': formatted_results,
                    'count': len(results),
                    'metadata': {
                        'evaluatedAt': datetime.now().isoformat(),
                        'xpath': xpath_expr
                    }
                })
                
            except Exception as e:
                self._send_response(400, {
                    'success': False,
                    'error': 'XPath evaluation error',
                    'details': str(e)
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
    
    def _evaluate_xpath(self, root, xpath_expr):
        """
        Evaluate XPath expression on XML element.
        Supports basic XPath patterns compatible with ElementTree.findall()
        """
        results = []
        
        # Handle common XPath patterns
        # Simple tag name
        if '/' not in xpath_expr and not xpath_expr.startswith('.') and not xpath_expr.startswith('@'):
            # Direct tag name
            elements = root.findall(f'.//{xpath_expr}')
            results.extend(elements)
        # Path with slashes
        elif xpath_expr.startswith('//'):
            # Descendant selector
            tag = xpath_expr[2:]  # Remove '//'
            elements = root.findall(f'.//{tag}')
            results.extend(elements)
        elif xpath_expr.startswith('/'):
            # Absolute path from root
            path = xpath_expr[1:]  # Remove leading '/'
            elements = root.findall(f'./{path}')
            results.extend(elements)
        elif xpath_expr.startswith('@'):
            # Attribute selector
            attr_name = xpath_expr[1:]
            # Find all elements with this attribute
            for elem in root.iter():
                if attr_name in elem.attrib:
                    results.append({
                        'type': 'attribute',
                        'element': elem.tag,
                        'attribute': attr_name,
                        'value': elem.attrib[attr_name]
                    })
        elif xpath_expr.startswith('.'):
            # Relative path
            elements = root.findall(xpath_expr)
            results.extend(elements)
        else:
            # Try to use findall directly
            try:
                elements = root.findall(xpath_expr)
                results.extend(elements)
            except:
                # Fallback: search for tag name anywhere
                tag = xpath_expr.split('/')[-1]
                elements = root.findall(f'.//{tag}')
                results.extend(elements)
        
        return results
    
    def _format_results_as_json(self, results):
        """Format XPath results as JSON."""
        formatted = []
        for result in results:
            if isinstance(result, dict):
                # Attribute result
                formatted.append(result)
            elif isinstance(result, ET.Element):
                # Element result
                formatted.append({
                    'tag': result.tag,
                    'attributes': result.attrib,
                    'text': result.text.strip() if result.text else '',
                    'children': [child.tag for child in result]
                })
            else:
                formatted.append(str(result))
        return formatted
    
    def _format_results_as_xml(self, results):
        """Format XPath results as XML string."""
        xml_parts = []
        for result in results:
            if isinstance(result, ET.Element):
                xml_parts.append(ET.tostring(result, encoding='unicode'))
            elif isinstance(result, dict):
                # Attribute result - format as XML attribute
                xml_parts.append(f'<attribute name="{result.get("attribute")}" value="{result.get("value")}" />')
            else:
                xml_parts.append(str(result))
        return '\n'.join(xml_parts)

