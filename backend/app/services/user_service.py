from ..extensions import db
from ..models.user import User


class UserService:
    @staticmethod
    def get_all_users():
        return User.query.order_by(User.id.desc()).all()

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def create_user(name, email):
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            raise ValueError("Email sudah digunakan")

        user = User(name=name, email=email)
        db.session.add(user)
        db.session.commit()
        return user
