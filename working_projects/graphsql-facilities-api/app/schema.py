from typing import List, Optional
from datetime import date
import strawberry
from strawberry.types import Info
from sqlmodel import select
import logging
from .models import FacilityRecord
from .database import get_session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@strawberry.input
class FacilityInput:
    source: str
    facility_name: str
    addr1: str
    addr2: Optional[str] = None
    city: str
    state: str
    zip: str
    auth_type: str
    auth_id: str
    expire_date: Optional[date] = None
    first_observed: Optional[date] = None
    data_type: str
    class_of_trade: str

def convert_facility_record_to_graphql(record: FacilityRecord) -> 'Facility':
    return Facility(
        facility_id=record.facility_id,
        source=record.source,
        facility_name=record.facility_name,
        addr1=record.addr1,
        addr2=record.addr2,
        city=record.city,
        state=record.state,
        zip=record.zip,
        auth_type=record.auth_type,
        auth_id=record.auth_id,
        expire_date=record.expire_date,
        first_observed=record.first_observed,
        data_type=record.data_type,
        class_of_trade=record.class_of_trade
    )

@strawberry.type
class Facility:
    facility_id: int
    source: str
    facility_name: str
    addr1: str
    addr2: Optional[str]
    city: str
    state: str
    zip: str
    auth_type: str
    auth_id: str
    expire_date: Optional[date]
    first_observed: Optional[date]
    data_type: str
    class_of_trade: str

@strawberry.type
class Query:
    @strawberry.field
    def facility(self, info: Info, facility_id: int) -> Optional[Facility]:
        logger.info(f"Querying facility with ID: {facility_id}")
        session = next(get_session())
        record = session.get(FacilityRecord, facility_id)
        if record:
            logger.info(f"Found facility: {record.facility_name}")
        else:
            logger.warning(f"No facility found with ID: {facility_id}")
        return convert_facility_record_to_graphql(record) if record else None

    @strawberry.field
    def facilities(self, info: Info) -> List[Facility]:
        logger.info("Querying all facilities")
        session = next(get_session())
        records = session.exec(select(FacilityRecord)).all()
        logger.info(f"Found {len(records)} facilities")
        return [convert_facility_record_to_graphql(record) for record in records]

    @strawberry.field
    def facilities_by_city(self, info: Info, city: str) -> List[Facility]:
        logger.info(f"Querying facilities in city: {city}")
        session = next(get_session())
        records = session.exec(select(FacilityRecord).where(FacilityRecord.city == city)).all()
        logger.info(f"Found {len(records)} facilities in {city}")
        return [convert_facility_record_to_graphql(record) for record in records]

    @strawberry.field
    def facilities_by_state(self, info: Info, state: str) -> List[Facility]:
        logger.info(f"Querying facilities in state: {state}")
        session = next(get_session())
        records = session.exec(select(FacilityRecord).where(FacilityRecord.state == state)).all()
        logger.info(f"Found {len(records)} facilities in state {state}")
        return [convert_facility_record_to_graphql(record) for record in records]

    @strawberry.field
    def search_facilities(
        self, 
        info: Info, 
        facility_name: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        auth_type: Optional[str] = None,
    ) -> List[Facility]:
        logger.info(f"Searching facilities with params: name={facility_name}, city={city}, state={state}, auth_type={auth_type}")
        session = next(get_session())
        query = select(FacilityRecord)
        
        if facility_name:
            query = query.where(FacilityRecord.facility_name.contains(facility_name))
        if city:
            query = query.where(FacilityRecord.city == city)
        if state:
            query = query.where(FacilityRecord.state == state)
        if auth_type:
            query = query.where(FacilityRecord.auth_type == auth_type)
            
        records = session.exec(query).all()
        logger.info(f"Found {len(records)} facilities matching search criteria")
        return [convert_facility_record_to_graphql(record) for record in records]

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_facility(
        self,
        info: Info,
        input: FacilityInput
    ) -> Facility:
        logger.info(f"Creating new facility: {input.facility_name}")
        session = next(get_session())
        facility_record = FacilityRecord(
            source=input.source,
            facility_name=input.facility_name,
            addr1=input.addr1,
            addr2=input.addr2,
            city=input.city,
            state=input.state,
            zip=input.zip,
            auth_type=input.auth_type,
            auth_id=input.auth_id,
            expire_date=input.expire_date,
            first_observed=input.first_observed,
            data_type=input.data_type,
            class_of_trade=input.class_of_trade,
        )
        session.add(facility_record)
        session.commit()
        session.refresh(facility_record)
        logger.info(f"Successfully created facility with ID: {facility_record.facility_id}")
        return convert_facility_record_to_graphql(facility_record)

schema = strawberry.Schema(query=Query, mutation=Mutation) 