from ..extensions import db
from ..models.inundation import Inundation

class InundationService:

    @staticmethod
    def get_all_inundations():
        inundations = Inundation.query.all()

        return {
            inundation.id: {
                "latitude": inundation.latitude,
                "longitude": inundation.longitude,
                "eta": inundation.eta
            }
            for inundation in inundations
    }

    @staticmethod
    def bulk_replace_inundation(inundation_data):
        inundation = []

        Inundation.query.delete()

        for item in inundation_data:
            inundation_item = Inundation(
                latitude=item["latitude"],
                longitude=item["longitude"],
                eta=item.get("eta")
            )
            inundation.append(inundation_item)

        db.session.add_all(inundation)
        db.session.commit()

        return inundation