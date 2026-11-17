# Clasificación de datos de OWASP Juice Shop

| Tipo de dato | Ejemplo en Juice Shop | Sensibilidad | Tratamiento requerido |
| :--- | :--- | :--- | :--- |
| Credenciales | Email y contraseña | **Alta** | Hashing fuerte (bcrypt/Argon2), no registrar en logs. |
| Tokens de sesión | JWT en localStorage y cookies | **Alta** | Cookies HttpOnly y Secure, expiración corta. |
| Datos personales | Nombre, dirección de envío | **Media-Alta** | Cifrado en tránsito (TLS), acceso restringido. |
| Datos de pago | Tarjetas de crédito (ficticias) | **Alta** | No almacenar datos reales, tokenización. |
| Historial de pedidos | Órdenes y facturas | **Media** | Acceso solo al dueño de la orden o admin. |
| Catálogo | Productos y precios | **Baja** | Público, pero protegido contra modificaciones no autorizadas. |