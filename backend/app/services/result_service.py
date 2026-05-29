from ..extensions import db
from ..models.result import Result

class ResultService:
    @staticmethod
    def save_result(person_id, ete_dijkstra, geometry_dijkstra, ete_dijkstra_rst, geometry_dijkstra_rst, movement_speed):
        result = Result(
            person_id=person_id,
            ete_dijkstra=ete_dijkstra,
            geometry_dijkstra=geometry_dijkstra,
            ete_dijkstra_rst=ete_dijkstra_rst,
            geometry_dijkstra_rst=geometry_dijkstra_rst,
            movement_speed=movement_speed
        )

        db.session.add(result)
        db.session.commit()

        return result
    
    @staticmethod
    def save_result_dijkstra(person_id, ete_dijkstra, geometry_dijkstra, movement_speed):
        result = Result(
            person_id=person_id,
            ete_dijkstra=ete_dijkstra,
            geometry_dijkstra=geometry_dijkstra,
            movement_speed=movement_speed
        )

        db.session.add(result)
        db.session.commit()

        return result
    
    @staticmethod
    def save_result_dijkstra_rst(person_id, ete_dijkstra_rst, geometry_dijkstra_rst, movement_speed):
        result = Result(
            person_id=person_id,
            ete_dijkstra_rst=ete_dijkstra_rst,
            geometry_dijkstra_rst=geometry_dijkstra_rst,
            movement_speed=movement_speed
        )

        db.session.add(result)
        db.session.commit()

        return result