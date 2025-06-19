import asyncio
import httpx
from typing import Dict, Any
import time
from datetime import datetime
from tqdm import tqdm
from test_stats import save_stats
from tabulate import tabulate

class AsyncFacilityAPIClient:
    def __init__(self, base_url: str = "http://api:8000"):
        self.base_url = f"{base_url}/graphql"
        self.client = httpx.AsyncClient()

    async def execute_query(self, query: str) -> Dict[str, Any]:
        response = await self.client.post(
            self.base_url,
            json={"query": query}
        )
        return response.json()

    async def create_facility(self, id: int) -> Dict[str, Any]:
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
        return await self.execute_query(query)

    async def get_all_facilities(self) -> Dict[str, Any]:
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
        return await self.execute_query(query)

    async def get_facility_by_id(self, id: int) -> Dict[str, Any]:
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
        return await self.execute_query(query)

    async def get_facilities_by_city(self, city: str) -> Dict[str, Any]:
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
        return await self.execute_query(query)

    async def close(self):
        await self.client.aclose()

async def main():
    VERSION = "Asynchronous v1.0"
    print(f"\n=== Running {VERSION} Tests ===")
    client = AsyncFacilityAPIClient()
    stats = {}
    
    try:
        # Create 25 facilities
        print("\n=== Creating 25 facilities ===")
        create_start = time.time()
        created_ids = []
        
        with tqdm(total=25, desc="Creating facilities") as pbar:
            batch_size = 5
            for i in range(0, 25, batch_size):
                batch = range(i + 1, i + batch_size + 1)
                tasks = [client.create_facility(id) for id in batch]
                results = await asyncio.gather(*tasks)
                for id, result in zip(batch, results):
                    created_ids.append(result.get('data', {}).get('createFacility', {}).get('facilityId'))
                    pbar.update(1)
                    pbar.set_postfix({'last_batch': f"{i+1}-{i+batch_size}"})
                await asyncio.sleep(0.5)

        create_end = time.time()
        stats['create_time'] = create_end - create_start
        stats['facilities_created'] = len(created_ids)

        # Query all facilities
        print("\n=== Querying all facilities ===")
        query_all_start = time.time()
        result = await client.get_all_facilities()
        facilities = result.get('data', {}).get('facilities', [])
        query_all_end = time.time()
        stats['query_all_time'] = query_all_end - query_all_start
        stats['total_facilities'] = len(facilities)
        print(f"Found facilities: {result}")

        # Query specific facilities concurrently
        print("\n=== Querying specific facilities ===")
        query_specific_start = time.time()
        ids = [1, 10, 25]
        tasks = [client.get_facility_by_id(id) for id in ids]
        results = await asyncio.gather(*tasks)
        query_specific_end = time.time()
        stats['query_specific_time'] = query_specific_end - query_specific_start
        for id, result in zip(ids, results):
            print(f"Facility {id}: {result}")

        # Query by city
        print("\n=== Querying facilities by city ===")
        query_city_start = time.time()
        result = await client.get_facilities_by_city("Example City")
        city_facilities = result.get('data', {}).get('facilitiesByCity', [])
        query_city_end = time.time()
        stats['query_city_time'] = query_city_end - query_city_start
        stats['city_facilities'] = len(city_facilities)
        print(f"Facilities in Example City: {result}")

        end_time = time.time()
        stats['total_time'] = end_time - create_start

        # Save statistics
        save_stats(stats, 'async_stats.json', VERSION)

        # Print statistics in table format
        print("\n=== Performance Statistics ===")
        stats_table = [
            ["Metric", "Value"],
            ["Version", VERSION],
            ["Test run at", datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ["Facilities created", stats['facilities_created']],
            ["Creation time", f"{stats['create_time']:.2f}s"],
            ["Average time per batch", f"{stats['create_time']/5:.2f}s"],
            ["Query all time", f"{stats['query_all_time']:.2f}s"],
            ["Query specific time", f"{stats['query_specific_time']:.2f}s"],
            ["Query city time", f"{stats['query_city_time']:.2f}s"],
            ["Total facilities", stats['total_facilities']],
            ["City facilities", stats['city_facilities']],
            ["Total execution time", f"{stats['total_time']:.2f}s"],
        ]
        print(tabulate(stats_table, headers="firstrow", tablefmt="grid"))

    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main()) 