#!/usr/bin/env python3
"""
Command line interface for JSONnymous data generation.
"""

import argparse
import json
import os
import sys
from typing import Dict, Any

from data_generator import DataGenerator
from data_anonymizer import DataAnonymizer
from json_processor import JSONProcessor
from swagger_parser import SwaggerParser


def main():
    parser = argparse.ArgumentParser(
        description="Generate realistic JSON data from a skeleton and optional Swagger schema"
    )
    
    # Main arguments
    parser.add_argument('--skeleton', '-s', type=str, help='Path to JSON skeleton file')
    parser.add_argument('--swagger', '-w', type=str, help='Path to Swagger/OpenAPI schema file')
    parser.add_argument('--output', '-o', type=str, help='Output file path (default: stdout)')
    parser.add_argument('--pretty', '-p', action='store_true', help='Pretty print JSON output')
    
    # Generation parameters
    parser.add_argument('--count', type=int, help='Number of items to generate when arrays are inferred (overrides defaults)')
    parser.add_argument('--seed', type=int, help='Seed for reproducible generation')

    # Anonymization mode
    parser.add_argument('--anonymize', '-a', type=str, help='Path to JSON file to anonymize')
    parser.add_argument('--analyze', type=str, help='Path to JSON file to analyze for sensitive fields')
    
    args = parser.parse_args()
    
    try:
        # Anonymization mode
        if args.anonymize:
            if not os.path.exists(args.anonymize):
                raise FileNotFoundError(f"The file to anonymize '{args.anonymize}' does not exist.")
            
            # Load the JSON file to anonymize
            with open(args.anonymize, 'r', encoding='utf-8') as f:
                data_to_anonymize = json.load(f)
            
            # Anonymize the data
            anonymizer = DataAnonymizer()
            anonymized_data = anonymizer.anonymize_json(data_to_anonymize)
            
            # Output the anonymized data
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump(anonymized_data, f, indent=2 if args.pretty else None, ensure_ascii=False)
                print(f"Anonymized data saved to {args.output}", file=sys.stderr)
            else:
                json.dump(anonymized_data, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
            
            return
        
        # Sensitive fields analysis mode
        if args.analyze:
            if not os.path.exists(args.analyze):
                raise FileNotFoundError(f"The file to analyze '{args.analyze}' does not exist.")
            
            # Load the JSON file to analyze
            with open(args.analyze, 'r', encoding='utf-8') as f:
                data_to_analyze = json.load(f)
            
            # Analyze sensitive fields
            anonymizer = DataAnonymizer()
            sensitive_fields = anonymizer.get_sensitive_fields(data_to_analyze)
            
            # Output the analysis
            analysis_result = {
                "sensitive_fields": sensitive_fields,
                "total_fields": len(sensitive_fields),
                "message": f"Found {len(sensitive_fields)} sensitive field(s)"
            }
            
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump(analysis_result, f, indent=2 if args.pretty else None, ensure_ascii=False)
                print(f"Analysis saved to {args.output}", file=sys.stderr)
            else:
                json.dump(analysis_result, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
            
            return
        
        # Generation mode (default mode)
        if not args.skeleton:
            raise ValueError("The --skeleton option is required for data generation.")
        
        # Check skeleton file existence
        if not os.path.exists(args.skeleton):
            raise FileNotFoundError(f"The skeleton file '{args.skeleton}' does not exist.")
        
        # Load JSON skeleton
        with open(args.skeleton, 'r', encoding='utf-8') as f:
            skeleton = json.load(f)
        
        # Load Swagger schema if provided
        swagger_schema = None
        if args.swagger:
            if not os.path.exists(args.swagger):
                raise FileNotFoundError(f"The Swagger file '{args.swagger}' does not exist.")
            
            parser = SwaggerParser()
            swagger_schema = parser.load_swagger(args.swagger)
        
        # Initialize data generator
        generator = DataGenerator()
        if args.seed is not None:
            try:
                generator.set_seed(int(args.seed))
            except Exception:
                pass
        
        # Process JSON with processor
        processor = JSONProcessor()
        result = processor.process_json(skeleton, swagger_schema, generator)

        # Apply count override to top-level arrays if requested and applicable
        if args.count is not None and isinstance(result, dict):
            def override_arrays(obj):
                if isinstance(obj, list):
                    # Simple strategy: repeat/trim to target length
                    if args.count >= 0:
                        if len(obj) == 0 and isinstance(skeleton, dict):
                            # Leave empty lists as-is when skeleton is empty; generation path handles counts
                            return obj
                        if len(obj) == 0:
                            return obj
                        sample = obj[0]
                        return [sample] * args.count
                if isinstance(obj, dict):
                    return {k: override_arrays(v) for k, v in obj.items()}
                return obj
            result = override_arrays(result)
        
        # Output result
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2 if args.pretty else None, ensure_ascii=False)
            print(f"Generated data saved to {args.output}", file=sys.stderr)
        else:
            json.dump(result, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main() 