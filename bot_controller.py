import logging
import threading
import time
from models import db, Config, LogEntry

class BotController:
    def __init__(self):
        self._running = False
        self._thread = None
        self._start_time = None
        self.logger = logging.getLogger(__name__)

        # Mensajes predefinidos de bienvenida
        self.welcome_messages = {
            "default": "¡Hola! Bienvenido al canal. Soy StrexxYT Bot y estoy aquí para ayudarte.",
            "formal": "Reciba un cordial saludo. Le damos la bienvenida al canal oficial. Es un placer tenerle con nosotros.",
            "casual": "¡Qué onda! Bienvenido al canal, espero que te la pases bien por aquí. ¡Disfruta del contenido!",
            "funny": "¡Alerta de nuevo usuario! 🎉 ¡Bienvenido al mejor canal del universo conocido y por conocer! 🚀"
        }

    def start(self):
        try:
            if not self._running:
                self._running = True
                self._start_time = time.time()
                self._thread = threading.Thread(target=self._bot_process)
                self._thread.daemon = True
                self._thread.start()
                self.logger.info("Bot iniciado")
                LogEntry.add_log("info", "Bot iniciado")
                return True
            return False
        except Exception as e:
            self.logger.error(f"Error al iniciar el bot: {str(e)}")
            LogEntry.add_log("error", f"Error al iniciar el bot: {str(e)}")
            self._running = False
            self._start_time = None
            return False

    def stop(self):
        if self._running:
            self._running = False
            self._start_time = None
            if self._thread:
                self._thread.join(timeout=2)
            self.logger.info("Bot detenido")
            LogEntry.add_log("info", "Bot detenido")

    def is_running(self):
        return self._running

    def get_status(self):
        return "encendido" if self._running else "apagado"
        
    def get_uptime(self):
        """Devuelve el tiempo que el bot ha estado activo en formato legible"""
        if not self._running or not self._start_time:
            return "0 segundos"
            
        seconds = int(time.time() - self._start_time)
        
        # Limitamos a máximo 5 meses (aproximadamente 13 millones de segundos)
        max_seconds = 13_000_000  # ~5 meses
        if seconds > max_seconds:
            seconds = max_seconds
            
        # Convertir a formato legible
        intervals = [
            ('meses', 2592000),  # 30 días
            ('días', 86400),
            ('horas', 3600),
            ('minutos', 60),
            ('segundos', 1)
        ]
        
        result = []
        for name, count in intervals:
            value = seconds // count
            if value:
                seconds -= value * count
                if value == 1:
                    name = name[:-1]  # quitar 's' para singular
                result.append(f"{value} {name}")
                
        return ", ".join(result)

    def set_welcome_message(self, message_type, message_content=None):
        """Establece el tipo de mensaje de bienvenida y su contenido si es personalizado"""
        try:
            config = Config.get_config()
            config.welcome_message_type = message_type

            if message_type == "custom" and message_content:
                config.custom_welcome_message = message_content

            db.session.commit()
            LogEntry.add_log("info", f"Mensaje de bienvenida actualizado a: {message_type}")
            return True, "Mensaje de bienvenida actualizado"
        except Exception as e:
            self.logger.error(f"Error al establecer mensaje de bienvenida: {str(e)}")
            LogEntry.add_log("error", f"Error al establecer mensaje de bienvenida: {str(e)}")
            return False, str(e)

    def get_welcome_message(self):
        """Devuelve el mensaje de bienvenida actual"""
        config = Config.get_config()
        if config.welcome_message_type == "custom":
            return config.custom_welcome_message
        else:
            return self.welcome_messages.get(config.welcome_message_type, self.welcome_messages["default"])

    def update_config(self, new_config):
        """Actualiza la configuración del bot"""
        try:
            config = Config.get_config()

            # Actualizar campos permitidos
            if "bot_name" in new_config:
                config.bot_name = new_config["bot_name"]
            if "response_delay" in new_config:
                config.response_delay = int(new_config["response_delay"])
            if "auto_start" in new_config:
                config.auto_start = bool(new_config["auto_start"])
            if "welcome_image_path" in new_config:
                config.welcome_image_path = new_config["welcome_image_path"]

            db.session.commit()
            LogEntry.add_log("info", "Configuración actualizada")
            return True, "Configuración actualizada"
        except Exception as e:
            self.logger.error(f"Error al actualizar configuración: {str(e)}")
            LogEntry.add_log("error", f"Error al actualizar configuración: {str(e)}")
            return False, str(e)
            
    def get_welcome_image(self):
        """Devuelve la ruta de la imagen de bienvenida actual"""
        config = Config.get_config()
        return config.welcome_image_path
        
    def set_welcome_image(self, image_path):
        """Establece la ruta de la imagen de bienvenida"""
        try:
            config = Config.get_config()
            config.welcome_image_path = image_path
            db.session.commit()
            LogEntry.add_log("info", f"Imagen de bienvenida actualizada a: {image_path}")
            return True, "Imagen de bienvenida actualizada"
        except Exception as e:
            self.logger.error(f"Error al establecer imagen de bienvenida: {str(e)}")
            LogEntry.add_log("error", f"Error al establecer imagen de bienvenida: {str(e)}")
            return False, str(e)

    def get_logs(self, level=None, limit=100):
        """Obtiene los registros del sistema"""
        return LogEntry.get_logs(level, limit)
        
    def clear_logs(self):
        """Elimina todos los registros del sistema"""
        try:
            # Llamar al método estático de LogEntry para eliminar registros
            LogEntry.clear_logs()
            self.logger.info("Registros eliminados correctamente")
            # No registramos esta acción para evitar agregar un registro después de limpiar
            return True, "Registros eliminados correctamente"
        except Exception as e:
            self.logger.error(f"Error al eliminar registros: {str(e)}")
            LogEntry.add_log("error", f"Error al eliminar registros: {str(e)}")
            return False, str(e)

    def _bot_process(self):
        """Simulación del proceso del bot"""
        while self._running:
            try:
                # Aquí iría la lógica real del bot
                time.sleep(1)
            except Exception as e:
                self.logger.error(f"Error en el proceso del bot: {str(e)}")
                LogEntry.add_log("error", f"Error en el proceso del bot: {str(e)}")
                self._running = False