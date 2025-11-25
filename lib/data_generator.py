"""
Module for generating coherent anonymized data.
Uses the Faker library to generate realistic data.
"""

from faker import Faker
import random
import uuid
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


class DataGenerator:
    """Coherent anonymized data generator."""
    
    def __init__(self, locale: str = 'en_US'):
        """
        Initialize the generator with a specific locale.
        
        Args:
            locale: Locale for generation (default English)
        """
        self.fake = Faker(locale)
        Faker.seed(42)  # For reproducibility
        
        # Cache to maintain consistency
        self._cached_data = {}
        
    def generate_by_type(self, field_type: str, field_name: str = "", 
                        constraints: Optional[Dict] = None) -> Any:
        """
        Generate data according to the specified type.
        
        Args:
            field_type: Type of data to generate
            field_name: Field name (to deduce type)
            constraints: Additional constraints
            
        Returns:
            Generated data
        """
        constraints = constraints or {}
        
        # Generation by type
        if field_type == "string":
            return self._generate_string(field_name, constraints)
        elif field_type == "integer":
            return self._generate_integer(constraints)
        elif field_type == "number":
            return self._generate_number(constraints)
        elif field_type == "boolean":
            return self._generate_boolean()
        elif field_type == "array":
            return self._generate_array(field_name, constraints)
        elif field_type == "object":
            return self._generate_object(constraints)
        else:
            return self._generate_string(field_name, constraints)
    
    def _generate_string(self, field_name: str, constraints: Dict) -> str:
        """Generate a string according to the field name."""
        field_name_lower = field_name.lower()
        
        # Type detection based on field name
        if any(keyword in field_name_lower for keyword in ['email', 'mail', 'e-mail']):
            return self._get_cached_or_generate(f"email_{field_name}", self.fake.email)
        
        elif any(keyword in field_name_lower for keyword in ['phone', 'telephone', 'tel']):
            return self._get_cached_or_generate(f"phone_{field_name}", self.fake.phone_number)
        
        elif any(keyword in field_name_lower for keyword in ['name', 'surname', 'lastname']):
            return self._get_cached_or_generate(f"name_{field_name}", self.fake.last_name)
        
        elif any(keyword in field_name_lower for keyword in ['firstname', 'given']):
            return self._get_cached_or_generate(f"firstname_{field_name}", self.fake.first_name)
        
        elif any(keyword in field_name_lower for keyword in ['address', 'addr']):
            return self._get_cached_or_generate(f"address_{field_name}", self.fake.address)
        
        elif any(keyword in field_name_lower for keyword in ['city']):
            return self._get_cached_or_generate(f"city_{field_name}", self.fake.city)
        
        elif any(keyword in field_name_lower for keyword in ['postal', 'zip']):
            return self._get_cached_or_generate(f"postal_{field_name}", self.fake.postcode)
        
        elif any(keyword in field_name_lower for keyword in ['country']):
            return self._get_cached_or_generate(f"country_{field_name}", self.fake.country)
        
        elif any(keyword in field_name_lower for keyword in ['company']):
            return self._get_cached_or_generate(f"company_{field_name}", self.fake.company)
        
        elif any(keyword in field_name_lower for keyword in ['url', 'website']):
            return self._get_cached_or_generate(f"url_{field_name}", self.fake.url)
        
        elif any(keyword in field_name_lower for keyword in ['date', 'created', 'updated']):
            return self._get_cached_or_generate(f"date_{field_name}", 
                                              lambda: self.fake.date_between(start_date='-2y', end_date='today').isoformat())
        
        elif any(keyword in field_name_lower for keyword in ['datetime', 'timestamp']):
            return self._get_cached_or_generate(f"datetime_{field_name}", 
                                              lambda: self.fake.date_time_between(start_date='-2y', end_date='now').isoformat())
        
        elif any(keyword in field_name_lower for keyword in ['id', 'uuid']):
            return str(uuid.uuid4())
        
        elif any(keyword in field_name_lower for keyword in ['description', 'comment', 'note']):
            return self._get_cached_or_generate(f"description_{field_name}", 
                                              lambda: self.fake.paragraph(nb_sentences=3))
        
        elif any(keyword in field_name_lower for keyword in ['title', 'subject']):
            return self._get_cached_or_generate(f"title_{field_name}", 
                                              lambda: self.fake.sentence(nb_words=4).rstrip('.'))
        
        # Check constraints
        if 'enum' in constraints:
            return random.choice(constraints['enum'])
        
        if 'pattern' in constraints:
            return self._generate_from_pattern(constraints['pattern'])
        
        if 'minLength' in constraints or 'maxLength' in constraints:
            min_len = constraints.get('minLength', 5)
            max_len = constraints.get('maxLength', 20)
            return self.fake.text(max_nb_chars=max_len)[:max_len]
        
        # Default: generate a generic word
        return self._get_cached_or_generate(f"word_{field_name}", self.fake.word)
    
    def _generate_integer(self, constraints: Dict) -> int:
        """Generate an integer with constraints."""
        min_val = constraints.get('minimum', 0)
        max_val = constraints.get('maximum', 1000)
        
        if 'multipleOf' in constraints:
            multiple = constraints['multipleOf']
            return random.randint(min_val // multiple, max_val // multiple) * multiple
        
        return random.randint(min_val, max_val)
    
    def _generate_number(self, constraints: Dict) -> float:
        """Generate a number with constraints."""
        min_val = constraints.get('minimum', 0.0)
        max_val = constraints.get('maximum', 1000.0)
        
        return round(random.uniform(min_val, max_val), 2)
    
    def _generate_boolean(self) -> bool:
        """Generate a random boolean."""
        return random.choice([True, False])
    
    def _generate_array(self, field_name: str, constraints: Dict) -> List[Any]:
        """Generate an array with constraints."""
        min_items = constraints.get('minItems', 1)
        max_items = constraints.get('maxItems', 5)
        
        items_count = random.randint(min_items, max_items)
        
        if 'items' in constraints:
            item_schema = constraints['items']
            item_type = item_schema.get('type', 'string')
            
            return [self.generate_by_type(item_type, f"{field_name}_item", item_schema) 
                   for _ in range(items_count)]
        
        # Default: generate strings
        return [self.fake.word() for _ in range(items_count)]
    
    def _generate_object(self, constraints: Dict) -> Dict[str, Any]:
        """Generate an object with constraints."""
        if 'properties' in constraints:
            obj = {}
            for prop_name, prop_schema in constraints['properties'].items():
                prop_type = prop_schema.get('type', 'string')
                obj[prop_name] = self.generate_by_type(prop_type, prop_name, prop_schema)
            return obj
        
        # Default: empty object
        return {}
    
    def _generate_from_pattern(self, pattern: str) -> str:
        """Generate a string matching a regex pattern (simplified)."""
        # Simple pattern matching - can be extended
        if pattern == r'^\d{4}-\d{2}-\d{2}$':
            return self.fake.date().isoformat()
        elif pattern == r'^\d{3}-\d{3}-\d{4}$':
            return f"{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        elif pattern == r'^[A-Z]{2}\d{4}$':
            return f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(1000, 9999)}"
        else:
            # Default: generate a generic string
            return self.fake.word()
    
    def _get_cached_or_generate(self, key: str, generator_func) -> str:
        """Get cached data or generate new one."""
        if key not in self._cached_data:
            self._cached_data[key] = generator_func()
        return self._cached_data[key]
    
    def clear_cache(self):
        """Clear the generation cache."""
        self._cached_data.clear()
    
    def set_seed(self, seed: int):
        """Set the random seed for reproducible generation."""
        Faker.seed(seed)
        random.seed(seed)

