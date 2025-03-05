
import os
import logging
import time
from flask import Flask, render_template, jsonify, request, redirect, url_for
from bot_controller import BotController
from models import db, Config, LogEntry
import datetime

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Configuración de SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bot.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar la base de datos
db.init_app(app)

# Crear todas las tablas si no existen
with app.app_context():
    db.create_all()

# Instancia del controlador del bot
bot_controller = BotController()

@app.route('/')
def index():
    try:
        bot_status = bot_controller.get_status()
        return render_template('index.html', bot_status=bot_status)
    except Exception as e:
        logger.error(f"Error al cargar la página principal: {str(e)}")
        return render_template('error.html', error="Error al cargar la página principal")

@app.route('/admin')
def admin_panel():
    try:
        # Pasamos la fecha actual para los registros de ejemplo
        current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Obtener registros recientes
        with app.app_context():
            logs = LogEntry.get_logs(limit=20)
        
        return render_template('admin.html', current_date=current_date, logs=logs)
    except Exception as e:
        logger.error(f"Error al cargar el panel de administración: {str(e)}")
        return render_template('error.html', error="Error al cargar el panel de administración")

@app.route('/bot/toggle', methods=['POST'])
def toggle_bot():
    try:
        if bot_controller.is_running():
            bot_controller.stop()
            status = "apagado"
            success = True
        else:
            success = bot_controller.start()
            status = "encendido" if success else "apagado"

        if success:
            return jsonify({
                "success": True,
                "status": status
            })
        else:
            return jsonify({
                "success": False,
                "error": "No se pudo cambiar el estado del bot"
            }), 500
    except Exception as e:
        error_msg = f"Error al cambiar el estado del bot: {str(e)}"
        logger.error(error_msg)
        LogEntry.add_log("error", error_msg)
        return jsonify({
            "success": False,
            "error": error_msg
        }), 500
        
@app.route('/bot/uptime', methods=['GET'])
def get_bot_uptime():
    try:
        uptime = bot_controller.get_uptime()
        return jsonify({
            "success": True,
            "uptime": uptime
        })
    except Exception as e:
        logger.error(f"Error al obtener el tiempo de actividad: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error al obtener el tiempo de actividad"
        }), 500

@app.route('/bot/welcome-message', methods=['POST'])
def set_welcome_message():
    try:
        data = request.json
        message_type = data.get('type')
        message_content = data.get('message')
        
        success, message = bot_controller.set_welcome_message(message_type, message_content)
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            })
        else:
            return jsonify({
                "success": False,
                "error": message
            }), 500
    except Exception as e:
        logger.error(f"Error al establecer mensaje de bienvenida: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error al establecer mensaje de bienvenida"
        }), 500

@app.route('/bot/welcome-image', methods=['GET'])
def get_welcome_image():
    try:
        image_path = bot_controller.get_welcome_image()
        return jsonify({
            "success": True,
            "image_path": image_path
        })
    except Exception as e:
        logger.error(f"Error al obtener imagen de bienvenida: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error al obtener imagen de bienvenida"
        }), 500

@app.route('/bot/welcome-image', methods=['POST'])
def set_welcome_image():
    try:
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No se ha enviado ninguna imagen"
            }), 400
            
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({
                "success": False,
                "error": "No se ha seleccionado ninguna imagen"
            }), 400
            
        # Verificar extensión de la imagen
        if not image_file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            return jsonify({
                "success": False,
                "error": "Formato de imagen no válido. Use PNG, JPG, JPEG o GIF"
            }), 400
        
        # Crear directorio si no existe
        os.makedirs('static/images/uploads', exist_ok=True)
        
        # Guardar la imagen con un nombre único
        filename = f"welcome_{int(time.time())}_{image_file.filename}"
        filepath = os.path.join('static/images/uploads', filename)
        
        # Obtener parámetros de personalización
        text_color = request.form.get('text_color', '#ffffff')
        border_color = request.form.get('border_color', '#000000')
        border_width = int(request.form.get('border_width', '3'))
        font_size = int(request.form.get('font_size', '24'))
        
        # Para personalizar la imagen necesitamos PIL
        try:
            from PIL import Image, ImageDraw, ImageFont, ImageOps
            
            # Primero guardar la imagen original
            image_file.save(filepath)
            
            # Abrir la imagen para modificarla
            img = Image.open(filepath)
            
            # Añadir borde si se especificó
            if border_width > 0:
                img = ImageOps.expand(img, border=border_width, fill=border_color)
            
            # Guardar la imagen modificada
            img.save(filepath)
            
        except ImportError:
            # Si PIL no está disponible, guardar la imagen sin modificar
            image_file.save(filepath)
            logger.warning("PIL no está instalado. No se puede personalizar la imagen.")
        
        # Actualizar la ruta en la configuración
        success, message = bot_controller.set_welcome_image(filepath)
        
        if success:
            return jsonify({
                "success": True,
                "message": message,
                "image_path": filepath
            })
        else:
            return jsonify({
                "success": False,
                "error": message
            }), 500
    except Exception as e:
        logger.error(f"Error al establecer imagen de bienvenida: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Error al establecer imagen de bienvenida: {str(e)}"
        }), 500

@app.route('/bot/config', methods=['POST'])
def update_bot_config():
    try:
        data = request.json
        success, message = bot_controller.update_config(data)
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            })
        else:
            return jsonify({
                "success": False,
                "error": message
            }), 500
    except Exception as e:
        logger.error(f"Error al actualizar la configuración: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error al actualizar la configuración"
        }), 500

@app.route('/admin/logs', methods=['GET'])
def get_logs():
    try:
        level = request.args.get('level')
        logs = bot_controller.get_logs(level=level)
        
        # Convertir a formato JSON
        logs_data = [{
            'id': log.id,
            'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'level': log.level,
            'message': log.message
        } for log in logs]
        
        return jsonify({
            "success": True,
            "logs": logs_data
        })
    except Exception as e:
        logger.error(f"Error al obtener registros: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error al obtener registros"
        }), 500

@app.route('/admin/logs/clear', methods=['POST'])
def clear_logs():
    try:
        # Llamar al método en el controlador para limpiar registros
        success, message = bot_controller.clear_logs()
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            })
        else:
            return jsonify({
                "success": False,
                "error": message
            }), 500
    except Exception as e:
        logger.error(f"Error al limpiar registros: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Error al limpiar registros: {str(e)}"
        }), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', error="Página no encontrada"), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('error.html', error="Error interno del servidor"), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
