from typing import Optional
from datetime import date
from sqlmodel import SQLModel, Field

class FacilityRecord(SQLModel, table=True):
    __tablename__ = "facilities"
    
    facility_id: Optional[int] = Field(default=None, primary_key=True)
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