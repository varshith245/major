import pytest
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

def test_schemes_dataset_exists_and_valid():
    dataset_file = DATA_DIR / "schemes_dataset.json"
    assert dataset_file.exists(), "schemes_dataset.json not found"
    
    with open(dataset_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    assert isinstance(data, list)
    assert len(data) >= 30, f"Expected at least 30 schemes, got {len(data)}"

    required_keys = [
        "scheme_id", "scheme_name", "short_name", "ministry", "level", 
        "category", "description", "key_benefits", "eligibility_criteria",
        "required_documents", "application_link"
    ]

    for item in data:
        for k in required_keys:
            assert k in item, f"Missing key '{k}' in scheme {item.get('scheme_id')}"
        
        crit = item["eligibility_criteria"]
        assert "min_age" in crit
        assert "max_age" in crit
        assert crit["min_age"] <= crit["max_age"]
        assert len(item["required_documents"]) >= 1

def test_eligibility_rules_dataset():
    rules_file = DATA_DIR / "eligibility_rules.json"
    assert rules_file.exists()
    with open(rules_file, "r", encoding="utf-8") as f:
        rules = json.load(f)
    assert len(rules) >= 5

def test_nlp_intent_dataset():
    nlp_file = DATA_DIR / "nlp_intent_dataset.json"
    assert nlp_file.exists()
    with open(nlp_file, "r", encoding="utf-8") as f:
        nlp_data = json.load(f)
    assert "intents" in nlp_data
    assert len(nlp_data["intents"]) == 5
    assert len(nlp_data["training_data"]) >= 25
