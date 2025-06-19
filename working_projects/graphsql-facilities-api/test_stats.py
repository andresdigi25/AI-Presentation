from tabulate import tabulate
from typing import Dict
import json
from datetime import datetime

def save_stats(stats: Dict, filename: str, version: str):
    stats['timestamp'] = datetime.now().isoformat()
    stats['version'] = version
    with open(f"/app/stats/{filename}", 'w') as f:
        json.dump(stats, f)

def load_stats(filename: str) -> Dict:
    with open(f"/app/stats/{filename}") as f:
        stats = json.load(f)
    stats['timestamp'] = datetime.fromisoformat(stats['timestamp'])
    return stats

def compare_stats(sync_stats: Dict, async_stats: Dict):
    comparison = [
        ["Metric", f"Synchronous\n({sync_stats['version']})", 
         f"Asynchronous\n({async_stats['version']})", "Difference", "Improvement"],
        ["Test run at", sync_stats['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
         async_stats['timestamp'].strftime('%Y-%m-%d %H:%M:%S'), "-", "-"],
        ["Facilities created", sync_stats['facilities_created'],
         async_stats['facilities_created'], "-", "-"],
        ["Creation time (s)", f"{sync_stats['create_time']:.2f}",
         f"{async_stats['create_time']:.2f}",
         f"{sync_stats['create_time'] - async_stats['create_time']:.2f}",
         f"{(1 - async_stats['create_time']/sync_stats['create_time'])*100:.1f}%"],
        ["Query all time (s)", f"{sync_stats['query_all_time']:.2f}",
         f"{async_stats['query_all_time']:.2f}",
         f"{sync_stats['query_all_time'] - async_stats['query_all_time']:.2f}",
         f"{(1 - async_stats['query_all_time']/sync_stats['query_all_time'])*100:.1f}%"],
        ["Query specific time (s)", f"{sync_stats['query_specific_time']:.2f}",
         f"{async_stats['query_specific_time']:.2f}",
         f"{sync_stats['query_specific_time'] - async_stats['query_specific_time']:.2f}",
         f"{(1 - async_stats['query_specific_time']/sync_stats['query_specific_time'])*100:.1f}%"],
        ["Query city time (s)", f"{sync_stats['query_city_time']:.2f}",
         f"{async_stats['query_city_time']:.2f}",
         f"{sync_stats['query_city_time'] - async_stats['query_city_time']:.2f}",
         f"{(1 - async_stats['query_city_time']/sync_stats['query_city_time'])*100:.1f}%"],
        ["Total time (s)", f"{sync_stats['total_time']:.2f}",
         f"{async_stats['total_time']:.2f}",
         f"{sync_stats['total_time'] - async_stats['total_time']:.2f}",
         f"{(1 - async_stats['total_time']/sync_stats['total_time'])*100:.1f}%"],
    ]
    
    print("\n=== Performance Comparison ===")
    print(tabulate(comparison, headers="firstrow", tablefmt="grid")) 