from dataclasses import dataclass

@dataclass
class IndicatorRequest:
    indicator: str

@dataclass
class CoordinatesRequest:
    coordinates: list