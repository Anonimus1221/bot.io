
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const botToggle = document.getElementById('botToggle');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const uptimeText = document.getElementById('uptimeText');
    const alertContainer = document.querySelector('.alert-container');
    const alertElement = document.querySelector('.alert');
    const welcomeMessageSelect = document.getElementById('welcomeMessageSelect');
    const customWelcomeMessage = document.getElementById('customWelcomeMessage');
    const saveWelcomeMessage = document.getElementById('saveWelcomeMessage');
    const welcomeImagePreview = document.getElementById('welcomeImagePreview');
    const welcomeImageUpload = document.getElementById('welcomeImageUpload');
    const saveWelcomeImage = document.getElementById('saveWelcomeImage');
    
    // Mensajes predefinidos
    const welcomeMessages = {
        "default": "¡Hola! Bienvenido al canal. Soy StrexxYT Bot y estoy aquí para ayudarte.",
        "formal": "Reciba un cordial saludo. Le damos la bienvenida al canal oficial. Es un placer tenerle con nosotros.",
        "casual": "¡Qué onda! Bienvenido al canal, espero que te la pases bien por aquí. ¡Disfruta del contenido!",
        "funny": "¡Alerta de nuevo usuario! 🎉 ¡Bienvenido al mejor canal del universo conocido y por conocer! 🚀"
    };
    
    // Intervalo para actualizar el tiempo de actividad
    let uptimeInterval = null;

    // Mostrar una alerta
    function showAlert(message, type) {
        if (alertElement && alertContainer) {
            alertElement.textContent = message;
            alertElement.className = `alert alert-${type}`;
            alertContainer.style.display = 'block';
            
            // Ocultar después de 3 segundos
            setTimeout(() => {
                alertContainer.style.display = 'none';
            }, 3000);
        }
    }
    
    // Cargar imagen de bienvenida
    async function loadWelcomeImage() {
        if (!welcomeImagePreview) return;
        
        try {
            const response = await fetch('/bot/welcome-image');
            const data = await response.json();
            
            if (data.success && data.image_path) {
                welcomeImagePreview.src = data.image_path;
                welcomeImagePreview.style.display = 'block';
            } else {
                welcomeImagePreview.src = 'static/images/default_welcome.png';
            }
        } catch (error) {
            console.error('Error al cargar la imagen:', error);
            if (welcomeImagePreview) {
                welcomeImagePreview.src = 'static/images/default_welcome.png';
            }
        }
    }
    
    // Alternar el bot encendido/apagado
    async function toggleBot() {
        if (!botToggle || !statusText || !statusIndicator) return;
        
        try {
            const response = await fetch('/bot/toggle', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                statusText.textContent = data.status;
                statusIndicator.className = data.status === 'encendido' ? 'status-indicator on' : 'status-indicator off';
                
                if (data.status === 'encendido') {
                    botToggle.textContent = 'Apagar Bot';
                    botToggle.classList.remove('btn-success');
                    botToggle.classList.add('btn-danger');
                    toggleUptimeInterval(true);
                } else {
                    botToggle.textContent = 'Encender Bot';
                    botToggle.classList.remove('btn-danger');
                    botToggle.classList.add('btn-success');
                    toggleUptimeInterval(false);
                }
                
                showAlert(`Bot ${data.status}`, 'success');
            } else {
                showAlert(data.error || 'Error al cambiar estado del bot', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión', 'danger');
        }
    }
    
    // Alternar el intervalo de tiempo de actividad
    function toggleUptimeInterval(start) {
        if (start) {
            if (!uptimeInterval) {
                uptimeInterval = setInterval(updateUptime, 10000); // Actualizar cada 10 segundos
                updateUptime(); // Actualizar inmediatamente
            }
        } else {
            if (uptimeInterval) {
                clearInterval(uptimeInterval);
                uptimeInterval = null;
            }
        }
    }
    
    // Actualizar el tiempo de actividad
    async function updateUptime() {
        if (!uptimeText) return;
        
        try {
            const response = await fetch('/bot/uptime');
            const data = await response.json();
            
            if (data.success) {
                uptimeText.textContent = data.uptime;
            }
        } catch (error) {
            console.error('Error al actualizar tiempo de actividad:', error);
        }
    }
    
    // Inicializar la página
    function initPage() {
        loadWelcomeImage();
        
        // Verificar si el bot está encendido inicialmente
        if (statusText && statusText.textContent.trim() === 'encendido' && botToggle) {
            botToggle.textContent = 'Apagar Bot';
            botToggle.classList.remove('btn-success');
            botToggle.classList.add('btn-danger');
            toggleUptimeInterval(true);
        }
    }
    
    // Evento: Cambiar estado del bot
    if (botToggle) {
        botToggle.addEventListener('click', toggleBot);
    }
    
    // Evento: Cambiar tipo de mensaje de bienvenida
    if (welcomeMessageSelect && customWelcomeMessage) {
        welcomeMessageSelect.addEventListener('change', function() {
            const selectedType = welcomeMessageSelect.value;
            
            if (selectedType === 'custom') {
                customWelcomeMessage.style.display = 'block';
            } else {
                customWelcomeMessage.style.display = 'none';
                customWelcomeMessage.value = welcomeMessages[selectedType] || '';
            }
        });
    }
    
    // Evento: Guardar mensaje de bienvenida
    if (saveWelcomeMessage && welcomeMessageSelect && customWelcomeMessage) {
        saveWelcomeMessage.addEventListener('click', async function() {
            const messageType = welcomeMessageSelect.value;
            const messageContent = messageType === 'custom' ? customWelcomeMessage.value : null;
            
            try {
                const response = await fetch('/bot/welcome-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: messageType,
                        message: messageContent
                    }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Mensaje de bienvenida actualizado', 'success');
                } else {
                    showAlert(data.error || 'Error al guardar mensaje', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            }
        });
    }
    
    // Evento: Guardar imagen de bienvenida
    if (saveWelcomeImage && welcomeImageUpload && welcomeImagePreview) {
        saveWelcomeImage.addEventListener('click', async function() {
            if (!welcomeImageUpload.files[0]) {
                showAlert('Selecciona una imagen primero', 'warning');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', welcomeImageUpload.files[0]);
            
            try {
                const response = await fetch('/bot/welcome-image', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Imagen de bienvenida actualizada', 'success');
                    welcomeImagePreview.src = data.image_path;
                    welcomeImagePreview.style.display = 'block';
                } else {
                    showAlert(data.error || 'Error al guardar imagen', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error de conexión', 'danger');
            }
        });
    }
    
    // Evento: Vista previa de la imagen de bienvenida
    if (welcomeImageUpload && welcomeImagePreview) {
        welcomeImageUpload.addEventListener('change', function() {
            if (welcomeImageUpload.files && welcomeImageUpload.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    welcomeImagePreview.src = e.target.result;
                    welcomeImagePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(welcomeImageUpload.files[0]);
            }
        });
    }
    
    // Iniciar la aplicación
    initPage();
});
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const botToggle = document.getElementById('toggleButton');
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');
    const buttonText = document.getElementById('buttonText');
    const uptimeText = document.getElementById('uptimeText');
    
    // Variable para controlar el intervalo de actualización del tiempo de actividad
    let uptimeInterval = null;
    
    // Inicializar la página
    initPage();
    
    // Función para mostrar alertas
    function showAlert(message, type = 'info') {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
        alertContainer.setAttribute('role', 'alert');
        
        alertContainer.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insertar al inicio del contenedor principal
        const container = document.querySelector('.container');
        container.insertBefore(alertContainer, container.firstChild);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            alertContainer.classList.remove('show');
            setTimeout(() => alertContainer.remove(), 300);
        }, 5000);
    }
    
    // Función para cambiar el estado del bot
    async function toggleBot() {
        try {
            const response = await fetch('/bot/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Actualizar la interfaz
                updateBotStatus(data.status);
                showAlert(`Bot ${data.status} exitosamente`, 'success');
            } else {
                showAlert('Error al cambiar el estado del bot: ' + data.error, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión al cambiar el estado del bot', 'danger');
        }
    }
    
    // Función para actualizar la interfaz según el estado del bot
    function updateBotStatus(status) {
        if (statusText) statusText.textContent = status;
        
        if (statusIcon) {
            if (status === 'encendido') {
                statusIcon.classList.remove('text-danger');
                statusIcon.classList.add('text-success');
            } else {
                statusIcon.classList.remove('text-success');
                statusIcon.classList.add('text-danger');
            }
        }
        
        if (buttonText) {
            buttonText.textContent = status === 'encendido' ? 'Apagar Bot' : 'Encender Bot';
        }
        
        if (botToggle) {
            if (status === 'encendido') {
                botToggle.classList.remove('btn-success');
                botToggle.classList.add('btn-danger');
            } else {
                botToggle.classList.remove('btn-danger');
                botToggle.classList.add('btn-success');
            }
        }
        
        // Iniciar o detener el intervalo de actualización del uptime
        toggleUptimeInterval(status === 'encendido');
    }
    
    // Función para controlar el intervalo de actualización del uptime
    function toggleUptimeInterval(start) {
        if (start) {
            if (!uptimeInterval) {
                updateUptime(); // Actualizar inmediatamente
                uptimeInterval = setInterval(updateUptime, 10000); // Luego cada 10 segundos
            }
        } else {
            if (uptimeInterval) {
                clearInterval(uptimeInterval);
                uptimeInterval = null;
            }
        }
    }
    
    // Actualizar el tiempo de actividad
    async function updateUptime() {
        if (!uptimeText) return;
        
        try {
            const response = await fetch('/bot/uptime');
            const data = await response.json();
            
            if (data.success) {
                uptimeText.textContent = data.uptime;
            }
        } catch (error) {
            console.error('Error al actualizar tiempo de actividad:', error);
        }
    }
    
    // Inicializar la página
    function initPage() {
        // Verificar si el bot está encendido inicialmente
        if (statusText && statusText.textContent.trim() === 'encendido') {
            updateBotStatus('encendido');
        } else {
            updateBotStatus('apagado');
        }
    }
    
    // Evento: Cambiar estado del bot
    if (botToggle) {
        botToggle.addEventListener('click', toggleBot);
    }
});
