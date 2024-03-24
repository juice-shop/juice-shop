import requests
from argparse import ArgumentParser

parser = ArgumentParser()
parser.add_argument("--org-id", dest="org_id", help="your Snyk Org ID", required=True)
parser.add_argument("--snyk-token", dest="snyk_token", help="your Snyk Token", required=True)
parser.add_argument("--origin", dest="origin", help="SCM type. Possible values: github, github-enterprise, azure-repos, bitbucket, gitlab", required=True)

args = parser.parse_args()

SNYK_TOKEN = args.snyk_token
ORG_ID = args.org_id
ORIGIN = args.origin

BASE_URL = "https://api.snyk.io"

def get_projects_page(next_url):

    # Add "next url" on to the BASE URL
    url = BASE_URL + next_url

    headers = {
        'Accept': 'application/vnd.api+json',
        'Authorization': f'token {SNYK_TOKEN}'
    }

    return requests.request("GET", url, headers=headers)

def get_all_projects():
    next_url = f"/rest/orgs/{ORG_ID}/projects?version=2024-03-12&limit=100&origins={ORIGIN}"

    all_projects = []

    while next_url is not None:
        res = get_projects_page(next_url).json()

        if 'links' in res and 'next' in res['links']:
            next_url = res['links']['next']
        else:
            next_url = None

        # add to list
        if 'data' in res:
            all_projects.extend(res['data'])

    return all_projects

def tag_project(project_id, key, value):
    url = f'https://api.snyk.io/v1/org/{ORG_ID}/project/{project_id}/tags'

    payload = {
        "key": key,
        "value": value
    }
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'token {SNYK_TOKEN}'
    }

    return requests.request("POST", url, headers=headers, json=payload)

def main():
    projects = get_all_projects()

    for p in projects:        
        project_id = p['id']
        repo = p['attributes']['name'].split(":")[0].split("(")[0]
        branch = p['attributes']['target_reference']
        tag_value = f'pkg:{repo}@{branch}'

        res = tag_project(project_id, 'component', tag_value)
        print(res.status_code, project_id, tag_value)

main()