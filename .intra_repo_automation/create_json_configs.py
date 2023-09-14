import json
from faker import Faker

fake = Faker()

num_configs = 300

for i in range(num_configs):

    # Define the data structure in the format you want
    data = {
        "config_name": fake.word(),
        "indentation": fake.random_int(min=1, max=100),
        "template_name": fake.sentence(),
        "usename": fake.user_name(),
        "additional_configs": {
            "ip_address": fake.ipv4(),
            "key": fake.uuid4(),
            "password": fake.password(length=10, special_chars=True, digits=True, upper_case=True, lower_case=True),
            "type": fake.random_element(elements=["Type A", "Type B", "Type C"]),
            "zipcode": fake.zipcode()
        },
        "sha": fake.sha256(),
        "sha1": fake.sha1(raw_output=False),
        "md5": fake.md5(raw_output=False),
    }

    # Specify the relative output JSON file path
    relative_output_file_path = f"../data/test_data/super_important_configs-{fake.uuid4()}.json"

    # copy a random set of keys from the data json into a new json for write
    new_data = {}
    number_of_keys_to_sample = fake.random_int(min=1, max=len(data.keys()))
    for i in range(number_of_keys_to_sample):
        key = fake.random_element(elements=list(data.keys()))
        if key not in new_data.keys():
            new_data[key] = data[key]

    # Write the data to the JSON file using the relative path
    with open(relative_output_file_path, "w") as json_file:
        json.dump(new_data, json_file, indent=4)

    print(f"JSON data has been written to {relative_output_file_path}")
