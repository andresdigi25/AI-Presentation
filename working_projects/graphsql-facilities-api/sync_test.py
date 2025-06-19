import requests
from typing import Dict, Any
import time
from datetime import datetime
from tqdm import tqdm
from test_stats import save_stats
from tabulate import tabulate

class FacilityAPIClient:
    def __init__(self, base_url: str = "http://api:8000"):
        self.base_url = f"{base_url}/graphql"

    def execute_query(self, query: str) -> Dict[str, Any]:
        response = requests.post(
            self.base_url,
            json={"query": query}
        )
        return response.json()

    def create_facility(self, id: int) -> Dict[str, Any]:
        query = """
        mutation {
            createFacility(input: {
                source: "API"
                facilityName: "Test Facility %d"
                addr1: "%d Main St"
                addr2: "Suite %d00"
                city: "Example City"
                state: "EX"
                zip: "1234%d"
                authType: "LICENSE"
                authId: "12345-%d"
                dataType: "PHARMACY"
                classOfTrade: "RETAIL"
            }) {
                facilityId
                facilityName
            }
        }
        """ % (id, id, id, id, id)
        return self.execute_query(query)

    def get_all_facilities(self) -> Dict[str, Any]:
        query = """
        {
            facilities {
                facilityId
                facilityName
                addr1
                city
                state
                zip
            }
        }
        """
        return self.execute_query(query)

    def get_facility_by_id(self, id: int) -> Dict[str, Any]:
        query = """
        {
            facility(facilityId: %d) {
                facilityId
                facilityName
                addr1
                addr2
                city
                state
                zip
                authType
                authId
            }
        }
        """ % id
        return self.execute_query(query)

    def get_facilities_by_city(self, city: str) -> Dict[str, Any]:
        query = """
        {
            facilitiesByCity(city: "%s") {
                facilityId
                facilityName
                addr1
                city
                state
                zip
            }
        }
        """ % city
        return self.execute_query(query)

def main():
    VERSION = "Synchronous v1.0"
    print(f"\n=== Running {VERSION} Tests ===")
    client = FacilityAPIClient()
    stats = {}
    
    # Create 25 facilities
    print("\n=== Creating 25 facilities ===")
    create_start = time.time()
    created_ids = []
    with tqdm(range(1, 26), desc="Creating facilities") as pbar:
        for i in pbar:
            result = client.create_facility(i)
            created_ids.append(result.get('data', {}).get('createFacility', {}).get('facilityId'))
            pbar.set_postfix({'last_id': result.get('data', {}).get('createFacility', {}).get('facilityId')})
            time.sleep(0.5)
    create_end = time.time()
    stats['create_time'] = create_end - create_start
    stats['facilities_created'] = len(created_ids)

    # Query all facilities
    print("\n=== Querying all facilities ===")
    query_all_start = time.time()
    result = client.get_all_facilities()
    facilities = result.get('data', {}).get('facilities', [])
    query_all_end = time.time()
    stats['query_all_time'] = query_all_end - query_all_start
    stats['total_facilities'] = len(facilities)
    print(f"Found facilities: {result}")

    # Query specific facilities
    print("\n=== Querying specific facilities ===")
    query_specific_start = time.time()
    specific_results = []
    for id in [1, 10, 25]:
        result = client.get_facility_by_id(id)
        specific_results.append(result)
        print(f"Facility {id}: {result}")
    query_specific_end = time.time()
    stats['query_specific_time'] = query_specific_end - query_specific_start

    # Query by city
    print("\n=== Querying facilities by city ===")
    query_city_start = time.time()
    result = client.get_facilities_by_city("Example City")
    city_facilities = result.get('data', {}).get('facilitiesByCity', [])
    query_city_end = time.time()
    stats['query_city_time'] = query_city_end - query_city_start
    stats['city_facilities'] = len(city_facilities)
    print(f"Facilities in Example City: {result}")

    end_time = time.time()
    stats['total_time'] = end_time - create_start

    # Save statistics
    save_stats(stats, 'sync_stats.json', VERSION)

    # Print statistics in table format
    print("\n=== Performance Statistics ===")
    stats_table = [
        ["Metric", "Value"],
        ["Version", VERSION],
        ["Test run at", datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ["Facilities created", stats['facilities_created']],
        ["Creation time", f"{stats['create_time']:.2f}s"],
        ["Average time per facility", f"{stats['create_time']/25:.2f}s"],
        ["Query all time", f"{stats['query_all_time']:.2f}s"],
        ["Query specific time", f"{stats['query_specific_time']:.2f}s"],
        ["Query city time", f"{stats['query_city_time']:.2f}s"],
        ["Total facilities", stats['total_facilities']],
        ["City facilities", stats['city_facilities']],
        ["Total execution time", f"{stats['total_time']:.2f}s"],
    ]
    print(tabulate(stats_table, headers="firstrow", tablefmt="grid"))

if __name__ == "__main__":
    main() 