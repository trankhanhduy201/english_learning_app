import json


def validate_json_serializable(data):
    json.dumps(data)
    return data
