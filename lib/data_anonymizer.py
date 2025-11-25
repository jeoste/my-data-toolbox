"""
JSON data anonymization module.
Allows mixing sensitive data while keeping the structure.
"""

import json
import random
from typing import Dict, Any, List, Optional, Union
from faker import Faker
import re


class DataAnonymizer:
    """JSON data anonymizer."""
    
    def __init__(self, locale: str = 'en_US'):
        """
        Initialize the anonymizer with a specific locale.
        
        Args:
            locale: Locale for generation (default English)
        """
        self.fake = Faker(locale)
        
        # Anonymized data pools
        self.pools = {
            'firstNames': [self.fake.first_name() for _ in range(100)],
            'lastNames': [self.fake.last_name() for _ in range(100)],
            'emails': [self.fake.email() for _ in range(100)],
            'phones': [self.fake.phone_number() for _ in range(100)],
            'addresses': [self.fake.address() for _ in range(100)],
            'streets': [self.fake.street_address() for _ in range(100)],
            'cities': [self.fake.city() for _ in range(100)],
            'postcodes': [self.fake.postcode() for _ in range(100)],
            'countries': [self.fake.country() for _ in range(100)],
            'companies': [self.fake.company() for _ in range(100)],
            'urls': [self.fake.url() for _ in range(100)],
            'sentences': [self.fake.sentence() for _ in range(100)],
            'paragraphs': [self.fake.paragraph() for _ in range(100)],
            'dates': [self.fake.date_between(start_date='-30y', end_date='today').isoformat() for _ in range(100)],
            'datetimes': [self.fake.date_time_between(start_date='-30y', end_date='now').isoformat() for _ in range(100)]
        }
        
        # Define patterns to identify sensitive fields
        self.sensitive_patterns = {
            'firstName': ['prenom', 'firstname', 'fname', 'given_name', 'first_name'],
            'lastName': ['nom', 'lastname', 'lname', 'surname', 'last_name', 'family_name'],
            'email': ['email', 'mail', 'e_mail', 'e-mail', 'adresse_email'],
            'phone': ['telephone', 'phone', 'tel', 'mobile', 'cellphone', 'numero'],
            'address': ['adresse', 'address', 'addr'],
            'street': ['rue', 'street', 'street_address', 'voie'],
            'city': ['ville', 'city', 'localite'],
            'postcode': ['code_postal', 'postal_code', 'zip', 'zip_code', 'postcode', 'postalcode'],
            'country': ['pays', 'country', 'nation'],
            'company': ['entreprise', 'company', 'societe', 'organization'],
            'url': ['url', 'website', 'site', 'lien'],
            'description': ['description', 'commentaire', 'comment', 'note'],
            'date': ['date', 'created_at', 'updated_at', 'created', 'updated'],
            'datetime': ['datetime', 'timestamp', 'time']
        }
    
    def anonymize_json(self, data: Union[Dict, List, str]) -> Union[Dict, List, str]:
        """
        Anonymize a JSON object by mixing sensitive data.
        
        Args:
            data: JSON data to anonymize (dict, list or JSON string)
            
        Returns:
            Anonymized data
        """
        # If it's a JSON string, parse it
        if isinstance(data, str):
            try:
                parsed_data = json.loads(data)
                anonymized = self._anonymize_recursive(parsed_data)
                return json.dumps(anonymized, indent=2, ensure_ascii=False)
            except json.JSONDecodeError:
                return data
        
        # Otherwise, process directly
        return self._anonymize_recursive(data)
    
    def _anonymize_recursive(self, data: Any) -> Any:
        """
        Recursively anonymize a data structure.
        
        Args:
            data: Data to anonymize
            
        Returns:
            Anonymized data
        """
        if isinstance(data, dict):
            anonymized = {}
            for key, value in data.items():
                if isinstance(value, str) and value.strip():
                    # Anonymize string values based on field name
                    anonymized[key] = self._anonymize_field(key, value)
                else:
                    # Recursive processing for objects and lists
                    anonymized[key] = self._anonymize_recursive(value)
            return anonymized
        
        elif isinstance(data, list):
            return [self._anonymize_recursive(item) for item in data]
        
        else:
            # Keep other types as is (numbers, booleans, null)
            return data
    
    def _anonymize_field(self, field_name: str, value: str) -> str:
        """
        Anonymize a field based on its name and value.
        
        Args:
            field_name: Field name
            value: Field value
            
        Returns:
            Anonymized value
        """
        field_name_lower = field_name.lower()
        
        # First name
        if any(pattern in field_name_lower for pattern in self.sensitive_patterns['firstName']):
            return random.choice(self.pools['firstNames'])
        
        # Last name
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['lastName']):
            return random.choice(self.pools['lastNames'])
        
        # Email
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['email']):
            return random.choice(self.pools['emails'])
        
        # Phone
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['phone']):
            return random.choice(self.pools['phones'])
        
        # Address
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['address']):
            return random.choice(self.pools['addresses'])
        
        # Street
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['street']):
            return random.choice(self.pools['streets'])
        
        # City
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['city']):
            return random.choice(self.pools['cities'])
        
        # Postal code
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['postcode']):
            return random.choice(self.pools['postcodes'])
        
        # Country
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['country']):
            return random.choice(self.pools['countries'])
        
        # Company
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['company']):
            return random.choice(self.pools['companies'])
        
        # URL
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['url']):
            return random.choice(self.pools['urls'])
        
        # Description/comment
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['description']):
            if len(value) > 100:
                return random.choice(self.pools['paragraphs'])
            else:
                return random.choice(self.pools['sentences'])
        
        # Date
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['date']):
            # Try to preserve format
            if 'T' in value or ':' in value:
                return random.choice(self.pools['datetimes'])
            else:
                return random.choice(self.pools['dates'])
        
        # Default: mix with generic data
        return self._anonymize_generic_string(value)
    
    def _anonymize_generic_string(self, value: str) -> str:
        """
        Anonymize a generic string.
        
        Args:
            value: Value to anonymize
            
        Returns:
            Anonymized value
        """
        # Preserve approximate length
        if len(value) <= 10:
            return self.fake.word()
        elif len(value) <= 50:
            return self.fake.sentence(nb_words=3)
        else:
            return self.fake.paragraph(nb_sentences=2)
    
    def add_to_pool(self, pool_name: str, values: List[str]):
        """
        Add values to an anonymization pool.
        
        Args:
            pool_name: Pool name
            values: Values to add
        """
        if pool_name not in self.pools:
            self.pools[pool_name] = []
        
        self.pools[pool_name].extend(values)
    
    def get_sensitive_fields(self, data: Union[Dict, List, str]) -> List[str]:
        """
        Analyze data to identify sensitive fields.
        
        Args:
            data: Data to analyze
            
        Returns:
            List of sensitive field names
        """
        # If it's a JSON string, parse it
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return []
        
        sensitive_fields = []
        self._find_sensitive_fields_recursive(data, sensitive_fields)
        return list(set(sensitive_fields))  # Remove duplicates
    
    def _find_sensitive_fields_recursive(self, data: Any, sensitive_fields: List[str], prefix: str = ""):
        """
        Recursively find sensitive fields in data.
        
        Args:
            data: Data to analyze
            sensitive_fields: List to store sensitive field names
            prefix: Current field path prefix
        """
        if isinstance(data, dict):
            for key, value in data.items():
                field_path = f"{prefix}.{key}" if prefix else key
                
                if isinstance(value, str) and value.strip():
                    # Check if this field is sensitive
                    if self._is_sensitive_field(key):
                        sensitive_fields.append(field_path)
                
                # Recursive processing
                self._find_sensitive_fields_recursive(value, sensitive_fields, field_path)
        
        elif isinstance(data, list):
            for i, item in enumerate(data):
                item_path = f"{prefix}[{i}]" if prefix else f"[{i}]"
                self._find_sensitive_fields_recursive(item, sensitive_fields, item_path)
    
    def _is_sensitive_field(self, field_name: str) -> bool:
        """
        Check if a field is considered sensitive.
        
        Args:
            field_name: Field name to check
            
        Returns:
            True if the field is sensitive
        """
        field_name_lower = field_name.lower()
        
        for pattern_list in self.sensitive_patterns.values():
            if any(pattern in field_name_lower for pattern in pattern_list):
                return True
        
        return False

