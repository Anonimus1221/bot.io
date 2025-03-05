from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Config(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bot_name = db.Column(db.String(100), nullable=False, default="StrexxYT Bot")
    response_delay = db.Column(db.Integer, nullable=False, default=1000)
    auto_start = db.Column(db.Boolean, default=False)
    welcome_message_type = db.Column(db.String(20), default="default")
    custom_welcome_message = db.Column(db.Text)
    welcome_image_path = db.Column(db.String(255), default="static/images/default_welcome.png")

    @staticmethod
    def get_config():
        """Retorna la configuración actual o crea una por defecto"""
        config = Config.query.first()
        if not config:
            config = Config()
            db.session.add(config)
            db.session.commit()
        return config

class LogEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    level = db.Column(db.String(20), nullable=False)  # info, warning, error
    message = db.Column(db.Text, nullable=False)

    @staticmethod
    def add_log(level, message):
        """Agrega una entrada de registro"""
        log = LogEntry(level=level, message=message)
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_logs(level=None, limit=100):
        """Obtiene los registros del sistema"""
        query = LogEntry.query.order_by(LogEntry.timestamp.desc())

        if level:
            query = query.filter_by(level=level)

        return query.limit(limit).all()

    @staticmethod
    def clear_logs():
        """Elimina todos los registros del sistema"""
        db.session.query(LogEntry).delete()
        db.session.commit()