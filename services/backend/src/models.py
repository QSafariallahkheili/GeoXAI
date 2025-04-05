from dataclasses import dataclass
from typing import List

@dataclass
class IndicatorRequest:
    indicator: str

@dataclass
class CoordinatesRequest:
    coordinates: list

@dataclass
class TableRequest:
    tablename: str

@dataclass
class PredictorRequest:
    predictorName: str
    bbox: list

@dataclass
class TableInstanceRequest:
    tableName: str
    instanceId: int

@dataclass
class GeojsonRequest:
    geojson: object

