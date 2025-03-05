document.addEventListener('DOMContentLoaded', function() {
    // Mostrar alertas
    function showAlert(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container position-fixed top-0 end-0 p-3';
        alertContainer.style.zIndex = '5000';

        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        alertContainer.appendChild(alertElement);
        document.body.appendChild(alertContainer);

        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertContainer);
            }, 300);
        }, 3000);
    }

    // Editar mensajes del sistema
    const editButtons = document.querySelectorAll('.btn-sm.btn-primary');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener la fila de la tabla que contiene el mensaje
            const row = this.closest('tr');
            const tipo = row.cells[0].textContent;
            const mensaje = row.cells[1].textContent;

            console.log(`Editando mensaje de ${tipo}: ${mensaje}`);

            // Crear el modal de edición
            const modalHTML = `
            <div class="modal fade" id="editMessageModal" tabindex="-1" aria-labelledby="editMessageModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editMessageModalLabel">Editar mensaje de ${tipo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editMessageForm">
                                <div class="mb-3">
                                    <label for="messageType" class="form-label">Tipo de mensaje</label>
                                    <select class="form-select" id="messageType">
                                        <option value="default" ${tipo === 'Bienvenida' ? 'selected' : ''}>Mensaje predeterminado</option>
                                        <option value="formal">Mensaje formal</option>
                                        <option value="casual">Mensaje casual</option>
                                        <option value="funny">Mensaje divertido</option>
                                        <option value="custom">Personalizado</option>
                                    </select>
                                </div>
                                <div class="mb-3 ${tipo === 'Bienvenida' ? '' : 'd-none'}" id="customMessageContainer">
                                    <label for="customMessage" class="form-label">Mensaje personalizado</label>
                                    <textarea class="form-control" id="customMessage" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="saveMessageBtn">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
            `;

            // Añadir el modal al documento
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('editMessageModal'));
            modal.show();

            // Manejar cambio de tipo de mensaje
            const messageTypeSelect = document.getElementById('messageType');
            const customMessageContainer = document.getElementById('customMessageContainer');

            messageTypeSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    customMessageContainer.classList.remove('d-none');
                } else {
                    customMessageContainer.classList.add('d-none');
                }
            });

            // Guardar mensaje
            document.getElementById('saveMessageBtn').addEventListener('click', async function() {
                const messageType = messageTypeSelect.value;
                const customMessage = document.getElementById('customMessage').value;

                try {
                    const response = await fetch('/bot/welcome-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            type: messageType,
                            message: customMessage
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        showAlert('Mensaje actualizado correctamente', 'success');
                        modal.hide();

                        // Actualizar la UI según el tipo seleccionado
                        let newMessage = "";
                        switch (messageType) {
                            case 'default':
                                newMessage = "¡Hola! Bienvenido al canal. Soy StrexxYT Bot y estoy aquí para ayudarte.";
                                break;
                            case 'formal':
                                newMessage = "Reciba un cordial saludo. Le damos la bienvenida al canal oficial. Es un placer tenerle con nosotros.";
                                break;
                            case 'casual':
                                newMessage = "¡Qué onda! Bienvenido al canal, espero que te la pases bien por aquí. ¡Disfruta del contenido!";
                                break;
                            case 'funny':
                                newMessage = "¡Alerta de nuevo usuario! 🎉 ¡Bienvenido al mejor canal del universo conocido y por conocer! 🚀";
                                break;
                            case 'custom':
                                newMessage = customMessage;
                                break;
                        }

                        // Actualizar el texto en la tabla
                        row.cells[1].textContent = newMessage;

                        // Eliminar el modal del DOM después de cerrarlo
                        document.getElementById('editMessageModal').addEventListener('hidden.bs.modal', function() {
                            document.body.removeChild(modalContainer);
                        });

                    } else {
                        showAlert(data.error || 'Error al actualizar el mensaje', 'danger');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('Error de conexión', 'danger');
                }
            });
        });
    });

    // Botón para añadir mensaje
    const addMessageBtn = document.getElementById('addMessageBtn');
    if (addMessageBtn) {
        addMessageBtn.addEventListener('click', function() {
            showAlert('Funcionalidad en desarrollo', 'info');
        });
    }

    // Configuración
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const botName = document.getElementById('botName').value;
            const responseDelay = document.getElementById('responseDelay').value;
            const autoStart = document.getElementById('autoStart').checked;

            // Aquí iría la lógica para guardar la configuración mediante AJAX
            saveConfig({botName, responseDelay, autoStart});
        });
    }

    // Funciones de administración
    function saveConfig(config) {
        // Simulación de guardado
        console.log('Guardando configuración:', config);

        // Mostrar notificación de éxito
        showNotification('Configuración guardada correctamente', 'success');
    }

    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Agregar al DOM
        document.querySelector('.card-body').prepend(notification);

        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 150);
        }, 3000);
    }

    // Manejo de edición de mensajes
    const editButtons2 = document.querySelectorAll('.btn-primary i.bi-pencil');
    editButtons2.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const messageType = row.cells[0].textContent;
            const messageText = row.cells[1].textContent;

            // Aquí iría lógica para abrir modal de edición
            console.log(`Editando mensaje de ${messageType}: ${messageText}`);
        });
    });

    // Formulario de configuración
    const configForm2 = document.getElementById('configForm');
    if (configForm2) {
        configForm2.addEventListener('submit', async function(event) {
            event.preventDefault();

            const botName = document.getElementById('botName').value;
            const responseDelay = document.getElementById('responseDelay').value;
            const autoStart = document.getElementById('autoStart').checked;

            try {
                const response = await fetch('/bot/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bot_name: botName,
                        response_delay: responseDelay,
                        auto_start: autoStart
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    showAlert('Configuración guardada correctamente', 'success');
                } else {
                    showAlert(data.error || 'Error al guardar la configuración', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error al guardar la configuración', 'danger');
            }
        });
    }

    // Gestión de imagen de bienvenida en el panel de administración
    const adminWelcomeImagePreview = document.getElementById('adminWelcomeImagePreview');
    const adminWelcomeImageUpload = document.getElementById('adminWelcomeImageUpload');
    const adminSaveWelcomeImage = document.getElementById('adminSaveWelcomeImage');

    // Función para mostrar alertas
    function showAlert2(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertContainer.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.querySelector('.card-body').prepend(alertContainer);

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertContainer);
            bsAlert.close();
        }, 5000);
    }

    // Cargar imagen de bienvenida actual en el panel de administración
    async function loadWelcomeImage() {
        if (!adminWelcomeImagePreview) return;

        try {
            const response = await fetch('/bot/welcome-image');
            const data = await response.json();

            if (data.success && data.image_path) {
                adminWelcomeImagePreview.src = `/${data.image_path}`;
            } else {
                adminWelcomeImagePreview.src = '/static/images/default_welcome.png';
            }
        } catch (error) {
            console.error('Error al cargar la imagen de bienvenida:', error);
            adminWelcomeImagePreview.src = '/static/images/default_welcome.png';
        }
    }

    // Cargar la imagen al iniciar
    loadWelcomeImage();

    // Previsualizar la imagen seleccionada en el panel de administración
    if (adminWelcomeImageUpload) {
        adminWelcomeImageUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    adminWelcomeImagePreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Guardar la imagen de bienvenida desde el panel de administración
    if (adminSaveWelcomeImage) {
        adminSaveWelcomeImage.addEventListener('click', async function() {
            if (!adminWelcomeImageUpload.files || !adminWelcomeImageUpload.files[0]) {
                showAlert2('Por favor, selecciona una imagen primero', 'warning');
                return;
            }

            const formData = new FormData();
            formData.append('image', adminWelcomeImageUpload.files[0]);

            try {
                adminSaveWelcomeImage.disabled = true;
                adminSaveWelcomeImage.innerHTML = '<i class="bi bi-hourglass"></i> Guardando...';

                const response = await fetch('/bot/welcome-image', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    showAlert2('Imagen de bienvenida actualizada correctamente', 'success');
                    adminWelcomeImagePreview.src = `/${data.image_path}`;
                } else {
                    showAlert2(data.error || 'Error al guardar la imagen', 'danger');
                }
            } catch (error) {
                console.error('Error al guardar la imagen:', error);
                showAlert2('Error al guardar la imagen', 'danger');
            } finally {
                adminSaveWelcomeImage.disabled = false;
                adminSaveWelcomeImage.innerHTML = '<i class="bi bi-check-circle"></i> Guardar imagen';
            }
        });
    }

    // Filtro de registros
    const logLevelFilter = document.getElementById('logLevelFilter');
    if (logLevelFilter) {
        logLevelFilter.addEventListener('change', async function() {
            await loadLogs(this.value);
        });
    }

    // Botón para descargar registros
    const downloadLogsBtn = document.getElementById('downloadLogs');
    if (downloadLogsBtn) {
        downloadLogsBtn.addEventListener('click', function() {
            downloadLogs();
        });
    }

    // Botón para limpiar registros
    const clearLogsBtn = document.getElementById('clearLogs');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas eliminar todos los registros?')) {
                clearLogs();
            }
        });
    }

    // Cargar registros por primera vez
    loadLogs();
});

async function clearLogs() {
    try {
        const response = await fetch('/admin/logs/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Registros eliminados correctamente', 'success');
            // Recargar la lista de registros vacía
            loadLogs();
        } else {
            showAlert('Error al eliminar registros: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión al eliminar registros', 'danger');
    }
}

async function loadLogs(level = '') {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;

    try {
        const response = await fetch(`/admin/logs?level=${level}`);
        const data = await response.json();

        if (data.success) {
            logsContainer.innerHTML = '';

            if (data.logs.length === 0) {
                logsContainer.innerHTML = '<div class="log-entry text-info">No hay registros disponibles</div>';
                return;
            }

            data.logs.forEach(log => {
                let logClass = 'text-white';
                if (log.level === 'info') logClass = 'text-info';
                else if (log.level === 'warning') logClass = 'text-warning';
                else if (log.level === 'error') logClass = 'text-danger';

                logsContainer.innerHTML += `
                    <div class="log-entry ${logClass}">
                        [${log.timestamp}] ${log.message}
                    </div>
                `;
            });
        } else {
            showAlert('Error al cargar registros: ' + data.error, 'danger');
        }
    } catch (error) {
        showAlert('Error de conexión', 'danger');
        console.error(error);
    }
}

function downloadLogs() {
    // Implementación futura: descargar registros como CSV
    showAlert('Función no implementada aún', 'warning');
}

document.getElementById('addMessageBtn').addEventListener('click', function() {
    // Crear modal de agregar mensaje dinámicamente
    const modalHtml = `
    <div class="modal fade" id="addMessageModal" tabindex="-1" aria-labelledby="addMessageModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addMessageModalLabel">Agregar Nuevo Mensaje</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="addMessageForm">
                        <div class="mb-3">
                            <label for="newMessageType" class="form-label">Tipo de Mensaje</label>
                            <input type="text" class="form-control" id="newMessageType" required>
                        </div>
                        <div class="mb-3">
                            <label for="newMessageText" class="form-label">Mensaje</label>
                            <textarea class="form-control" id="newMessageText" rows="3" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success" id="saveNewMessage">Guardar</button>
                </div>
            </div>
        </div>
    </div>`;

    // Añadir modal al body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Mostrar modal
    const addMessageModal = new bootstrap.Modal(document.getElementById('addMessageModal'));
    addMessageModal.show();

    // Evento para guardar el nuevo mensaje
    document.getElementById('saveNewMessage').addEventListener('click', function() {
        const newMessageType = document.getElementById('newMessageType').value;
        const newMessageText = document.getElementById('newMessageText').value;

        if (!newMessageType || !newMessageText) {
            showNotification('warning', 'Por favor complete todos los campos');
            return;
        }

        // Añadir a la tabla
        const tableBody = document.querySelector('.table tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${newMessageType}</td>
            <td>${newMessageText}</td>
            <td>
                <button class="btn btn-sm btn-primary"><i class="bi bi-pencil"></i></button>
            </td>
        `;

        tableBody.appendChild(newRow);

        // Añadir evento de clic al nuevo botón de edición
        const editButton = newRow.querySelector('.btn-primary');
        editButton.addEventListener('click', function() {
            const row = this.closest('tr');
            const messageType = row.cells[0].textContent;
            const messageText = row.cells[1].textContent;

            // Lógica de edición (reutilizada)
            console.log(`Editando mensaje de ${messageType}: ${messageText}`);
            // Aquí se implementaría la misma lógica de edición que en los otros botones
        });

        // Mostrar notificación de éxito
        showNotification('success', 'Mensaje agregado correctamente');

        // Cerrar modal
        addMessageModal.hide();
        document.getElementById('addMessageModal').remove();
    });

    // Eliminar modal del DOM cuando se cierra
    document.getElementById('addMessageModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('addMessageModal').remove();
    });
});