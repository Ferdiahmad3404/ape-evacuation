from ..extensions import db
from ..models.result import Result
import math

class ResultService:
    @staticmethod
    def get_all_result_by_person_id(person_id):
        result = Result.query.filter_by(person_id=person_id).all()

        data = []
        for res in result:
            row = res.to_dict()

            if row.get("ete_dijkstra_rst") is not None and math.isinf(row["ete_dijkstra_rst"]):
                row["ete_dijkstra_rst"] = None

            data.append(row)

        return data

    @staticmethod
    def save_result(person_id, ete_dijkstra, node_information_dijkstra, edge_information_dijkstra, geometry_dijkstra, ete_dijkstra_rst, node_information_dijkstra_rst, edge_information_dijkstra_rst, geometry_dijkstra_rst, evacuation_point_name, movement_speed):
        result = Result(
            person_id=person_id,
            ete_dijkstra=ete_dijkstra,
            node_information_dijkstra=node_information_dijkstra,
            edge_information_dijkstra=edge_information_dijkstra,
            geometry_dijkstra=geometry_dijkstra,
            ete_dijkstra_rst=ete_dijkstra_rst,
            node_information_dijkstra_rst=node_information_dijkstra_rst,
            edge_information_dijkstra_rst=edge_information_dijkstra_rst,
            geometry_dijkstra_rst=geometry_dijkstra_rst,
            evacuation_point_name=evacuation_point_name,
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
    
    @staticmethod
    def delete_results_by_persons(persons):
        results = []
        for person in persons:
            result = Result.query.filter_by(person_id=person.id).all()

            for res in result:
                db.session.delete(res)
                results.append(res)

        db.session.commit()

        return results