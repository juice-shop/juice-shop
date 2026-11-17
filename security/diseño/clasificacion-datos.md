# Clasificación de Datos

Identificar la sensibilidad de la información es fundamental para aplicar los controles de seguridad correctos. Se clasifica en Baja, Media, Alta y Crítica.

| Tipo de Dato | Ejemplo en Juice Shop | Nivel de Sensibilidad | Tratamiento Requerido |
| :--- | :--- | :--- | :--- |
| **Credenciales** | Email y contraseña de usuarios | **Crítica** | Hash seguro (bcrypt), nunca registrar en logs, forzar HTTPS. |
| **Tokens de Sesión** | JWT guardados en el navegador | **Alta** | Uso de cookies `HttpOnly` y `Secure`, expiración corta. |
| **Datos Personales** | Nombres, direcciones de envío | **Alta** | Cifrado en tránsito (TLS), acceso restringido solo al dueño. |
| **Datos de Pago** | Tarjetas de crédito (ficticias) | **Crítica** | No almacenar datos reales. Tokenización (PCI-DSS). |
| **Historial y Facturas**| Órdenes de compra, facturas PDF | **Media** | Validar que el usuario solo vea sus propias órdenes (Control de acceso). |
| **Catálogo** | Productos, precios, reseñas | **Baja** | Información pública, pero protegida contra modificaciones. |