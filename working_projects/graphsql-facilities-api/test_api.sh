#!/bin/bash

# Function to create a facility
create_facility() {
    local id=$1
    echo -e "\nCreating facility ${id}..."
    response=$(curl -s -X POST \
        'http://localhost:8000/graphql' \
        -H 'Content-Type: application/json' \
        -d '{"query": "mutation { createFacility(input: { source: \"API\", facilityName: \"Test Facility '"${id}"'\", addr1: \"'"${id}"' Main St\", addr2: \"Suite '"${id}"'00\", city: \"Example City\", state: \"EX\", zip: \"1234'"${id}"'\", authType: \"LICENSE\", authId: \"12345-'"${id}"'\", dataType: \"PHARMACY\", classOfTrade: \"RETAIL\" }) { facilityId facilityName } }"}')
    
    echo "Response: $response"
    sleep 1  # Add small delay between requests
}

# Function to query all facilities
query_all_facilities() {
    echo -e "\nQuerying all facilities..."
    response=$(curl -s -X POST \
        'http://localhost:8000/graphql' \
        -H 'Content-Type: application/json' \
        -d '{"query": "{ facilities { facilityId facilityName addr1 city state zip } }"}')
    
    echo "Response: $response"
}

# Function to query facility by ID
query_facility_by_id() {
    local id=$1
    echo -e "\nQuerying facility with ID ${id}..."
    response=$(curl -s -X POST \
        'http://localhost:8000/graphql' \
        -H 'Content-Type: application/json' \
        -d '{"query": "{ facility(facilityId: '"${id}"') { facilityId facilityName addr1 addr2 city state zip authType authId } }"}')
    
    echo "Response: $response"
}

# Function to query facilities by city
query_facilities_by_city() {
    local city=$1
    echo -e "\nQuerying facilities in city: ${city}..."
    response=$(curl -s -X POST \
        'http://localhost:8000/graphql' \
        -H 'Content-Type: application/json' \
        -d '{"query": "{ facilitiesByCity(city: \"'"${city}"'\") { facilityId facilityName addr1 city state zip } }"}')
    
    echo "Response: $response"
}

# Function to query facilities by state
query_facilities_by_state() {
    local state=$1
    echo -e "\nQuerying facilities in state: ${state}..."
    response=$(curl -s -X POST \
        'http://localhost:8000/graphql' \
        -H 'Content-Type: application/json' \
        -d '{"query": "{ facilitiesByState(state: \"'"${state}"'\") { facilityId facilityName addr1 city state zip } }"}')
    
    echo "Response: $response"
}

# Function to search facilities
search_facilities() {
    local name=$1
    local city=$2
    local state=$3
    echo -e "\nSearching facilities with name: ${name}, city: ${city}, state: ${state}..."
    response=$(curl -s -X POST \
        'http://localhost:8000/graphql' \
        -H 'Content-Type: application/json' \
        -d '{"query": "{ searchFacilities(facilityName: \"'"${name}"'\", city: \"'"${city}"'\", state: \"'"${state}"'\") { facilityId facilityName addr1 city state zip } }"}')
    
    echo "Response: $response"
}

echo -e "\n=== Creating 10 facilities ===\n"
for i in {1..10}; do
    create_facility $i
done

echo -e "\n=== Querying all facilities ===\n"
query_all_facilities

echo -e "\n=== Querying specific facilities by ID ===\n"
query_facility_by_id 1
query_facility_by_id 5
query_facility_by_id 10

echo -e "\n=== Querying facilities by city ===\n"
query_facilities_by_city "Example City"

echo -e "\n=== Querying facilities by state ===\n"
query_facilities_by_state "EX"

echo -e "\n=== Searching facilities with multiple criteria ===\n"
search_facilities "Test" "Example City" "EX" 