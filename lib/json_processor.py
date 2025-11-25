"""
JSON skeleton processing module.
Combines data generation with Swagger constraints.
"""

import json
import sys
import os
from typing import Dict, Any, Optional, List, Union

# Add lib directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_generator import DataGenerator
from swagger_parser import SwaggerParser


class JSONProcessor:
    """JSON skeleton processor."""
    
    def __init__(self):
        pass
    
    def process_json(self, skeleton: Dict[str, Any], 
                    swagger_spec: Optional[Dict[str, Any]] = None,
                    data_generator: Optional[DataGenerator] = None) -> Dict[str, Any]:
        """
        Process a JSON skeleton and generate final data.
        
        Args:
            skeleton: JSON skeleton to fill
            swagger_spec: Swagger specification (optional)
            data_generator: Data generator
            
        Returns:
            JSON with generated data
        """
        if not data_generator:
            data_generator = DataGenerator()
        
        # Create Swagger parser if available
        swagger_parser = None
        if swagger_spec:
            swagger_parser = SwaggerParser()
            swagger_parser.swagger_spec = swagger_spec
            swagger_parser._extract_schemas()
        
        # Recursive processing
        return self._process_recursive(skeleton, data_generator, swagger_parser)
    
    def _process_recursive(self, data: Any, generator: DataGenerator, 
                          swagger_parser: Optional[SwaggerParser] = None,
                          current_path: str = "") -> Any:
        """
        Recursively process data structure.
        
        Args:
            data: Data to process
            generator: Data generator
            swagger_parser: Swagger parser (optional)
            current_path: Current path in structure
            
        Returns:
            Processed data
        """
        if isinstance(data, dict):
            result = {}
            
            for key, value in data.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                if self._is_empty_value(value):
                    # Generate data for empty values
                    result[key] = self._generate_value_for_field(
                        key, new_path, generator, swagger_parser
                    )
                else:
                    # Recursive processing
                    result[key] = self._process_recursive(
                        value, generator, swagger_parser, new_path
                    )
            
            return result
        
        elif isinstance(data, list):
            # Array processing
            if not data:
                # Empty array - generate elements
                return self._generate_array_elements(current_path, generator, swagger_parser)
            else:
                # Recursive processing of elements
                return [
                    self._process_recursive(item, generator, swagger_parser, f"{current_path}[{i}]")
                    for i, item in enumerate(data)
                ]
        
        elif self._is_empty_value(data):
            # Empty value - generate
            return self._generate_value_for_field(
                current_path.split('.')[-1] if current_path else "",
                current_path,
                generator,
                swagger_parser
            )
        
        else:
            # Non-empty value - preserve
            return data
    
    def _is_empty_value(self, value: Any) -> bool:
        """
        Determine if a value is considered empty.
        
        Args:
            value: Value to test
            
        Returns:
            True if the value is empty
        """
        if value is None:
            return True
        
        if isinstance(value, str):
            return value == "" or value.strip() == ""
        
        if isinstance(value, (list, dict)):
            return len(value) == 0
        
        # Special values indicating generation needed
        if isinstance(value, str) and value.startswith("@"):
            return True
        
        return False
    
    def _generate_value_for_field(self, field_name: str, field_path: str,
                                generator: DataGenerator,
                                swagger_parser: Optional[SwaggerParser] = None) -> Any:
        """
        Generate a value for a given field.
        
        Args:
            field_name: Field name
            field_path: Complete field path
            generator: Data generator
            swagger_parser: Swagger parser (optional)
            
        Returns:
            Generated value
        """
        constraints = {}
        field_type = "string"  # Default
        
        # Get constraints from Swagger
        if swagger_parser:
            swagger_constraints = swagger_parser.get_constraints_for_field(field_path)
            if swagger_constraints:
                constraints.update(swagger_constraints)
                field_type = constraints.get('type', 'string')
        
        # Infer type from field name if no Swagger constraints
        if not constraints:
            field_type = self._infer_type_from_name(field_name)
        
        return generator.generate_by_type(field_type, field_name, constraints)
    
    def _infer_type_from_name(self, field_name: str) -> str:
        """
        Infer type of a field from its name.
        
        Args:
            field_name: Field name
            
        Returns:
            Inferred type
        """
        field_name_lower = field_name.lower()
        
        # Integers
        if any(keyword in field_name_lower for keyword in ['id', 'count', 'number', 'age', 'year']):
            return "integer"
        
        # Decimal numbers
        if any(keyword in field_name_lower for keyword in ['price', 'amount', 'cost', 'rate', 'percent']):
            return "number"
        
        # Booleans
        if any(keyword in field_name_lower for keyword in ['is_', 'has_', 'can_', 'active', 'enabled']):
            return "boolean"
        
        # Arrays
        if field_name_lower.endswith('s') or 'list' in field_name_lower:
            return "array"
        
        # Default: string
        return "string"
    
    def _generate_array_elements(self, field_path: str, generator: DataGenerator,
                               swagger_parser: Optional[SwaggerParser] = None) -> List[Any]:
        """
        Generate elements for an empty array.
        
        Args:
            field_path: Array field path
            generator: Data generator
            swagger_parser: Swagger parser (optional)
            
        Returns:
            Generated array elements
        """
        # Default: generate 2-3 elements
        num_elements = 2
        
        # Get constraints from Swagger
        if swagger_parser:
            constraints = swagger_parser.get_constraints_for_field(field_path)
            if constraints:
                num_elements = constraints.get('minItems', 2)
        
        # Generate elements
        elements = []
        for i in range(num_elements):
            # Try to infer element type from field name
            field_name = field_path.split('.')[-1] if '.' in field_path else field_path
            element_type = self._infer_array_element_type(field_name)
            
            element = generator.generate_by_type(element_type, f"{field_name}_item")
            elements.append(element)
        
        return elements
    
    def _infer_array_element_type(self, array_field_name: str) -> str:
        """
        Infer the type of array elements from the array field name.
        
        Args:
            array_field_name: Array field name
            
        Returns:
            Inferred element type
        """
        field_name_lower = array_field_name.lower()
        
        # Common patterns
        if any(keyword in field_name_lower for keyword in ['ids', 'numbers']):
            return "integer"
        
        if any(keyword in field_name_lower for keyword in ['prices', 'amounts', 'costs']):
            return "number"
        
        if any(keyword in field_name_lower for keyword in ['flags', 'states']):
            return "boolean"
        
        # Default: string
        return "string"
    
    def validate_generated_data(self, data: Dict[str, Any],
                              swagger_parser: Optional[SwaggerParser] = None) -> List[str]:
        """
        Validate generated data.
        
        Args:
            data: Data to validate
            swagger_parser: Swagger parser (optional)
            
        Returns:
            List of validation errors
        """
        errors = []
        
        if swagger_parser:
            self._validate_recursive(data, swagger_parser, errors)
        
        return errors
    
    def _validate_recursive(self, data: Any, swagger_parser: SwaggerParser,
                          errors: List[str], current_path: str = ""):
        """
        Recursively validate data.
        
        Args:
            data: Data to validate
            swagger_parser: Swagger parser
            errors: Error list
            current_path: Current path in structure
        """
        if isinstance(data, dict):
            for key, value in data.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                # Get constraints for this field
                constraints = swagger_parser.get_constraints_for_field(new_path)
                if constraints:
                    self._validate_field(value, constraints, new_path, errors)
                
                # Recursive validation
                self._validate_recursive(value, swagger_parser, errors, new_path)
        
        elif isinstance(data, list):
            for i, item in enumerate(data):
                item_path = f"{current_path}[{i}]" if current_path else f"[{i}]"
                self._validate_recursive(item, swagger_parser, errors, item_path)
    
    def _validate_field(self, value: Any, constraints: Dict[str, Any],
                       field_path: str, errors: List[str]):
        """
        Validate a field against its constraints.
        
        Args:
            value: Value to validate
            constraints: Field constraints
            field_path: Field path
            errors: Error list
        """
        # Type validation
        if 'type' in constraints:
            expected_type = constraints['type']
            if not self._check_type(value, expected_type):
                errors.append(f"Field '{field_path}': expected type {expected_type}, got {type(value).__name__}")
        
        # String constraints
        if isinstance(value, str):
            if 'minLength' in constraints and len(value) < constraints['minLength']:
                errors.append(f"Field '{field_path}': string too short (min: {constraints['minLength']})")
            
            if 'maxLength' in constraints and len(value) > constraints['maxLength']:
                errors.append(f"Field '{field_path}': string too long (max: {constraints['maxLength']})")
        
        # Numeric constraints
        if isinstance(value, (int, float)):
            if 'minimum' in constraints and value < constraints['minimum']:
                errors.append(f"Field '{field_path}': value too small (min: {constraints['minimum']})")
            
            if 'maximum' in constraints and value > constraints['maximum']:
                errors.append(f"Field '{field_path}': value too large (max: {constraints['maximum']})")
    
    def _check_type(self, value: Any, expected_type: str) -> bool:
        """
        Check if a value matches the expected type.
        
        Args:
            value: Value to check
            expected_type: Expected type
            
        Returns:
            True if type matches
        """
        if expected_type == "string":
            return isinstance(value, str)
        elif expected_type == "integer":
            return isinstance(value, int)
        elif expected_type == "number":
            return isinstance(value, (int, float))
        elif expected_type == "boolean":
            return isinstance(value, bool)
        elif expected_type == "array":
            return isinstance(value, list)
        elif expected_type == "object":
            return isinstance(value, dict)
        else:
            return True  # Unknown type, accept any value

