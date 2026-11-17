# Requisitos de seguridad (OWASP ASVS v4.0.3)

| ID | Categoría ASVS | Requisito | Justificación en Juice Shop |
| :--- | :--- | :--- | :--- |
| **REQ-01** | V2.1.1 (Autenticación) | Las contraseñas deben tener mínimo 12 caracteres y no estar en listas de contraseñas comunes. | Juice Shop permite contraseñas débiles como "admin123". |
| **REQ-02** | V2.2.1 (Autenticación) | Implementar bloqueo tras 5 intentos fallidos (anti-brute force). | No hay rate limiting en el login. |
| **REQ-03** | V3.4.1 (Sesión) | Las cookies de sesión deben tener el atributo `Secure`. | El despliegue local debe forzar HTTPS. |
| **REQ-04** | V3.4.2 (Sesión) | Las cookies de sesión deben tener `HttpOnly`. | Evita robo de sesión vía XSS. |
| **REQ-05** | V4.1.1 (Control de acceso) | Validar permisos en el servidor en cada endpoint (no solo en el frontend). | Muchos endpoints confían en el cliente. |
| **REQ-06** | V5.1.1 (Validación) | Sanitizar y validar toda entrada de usuario (SQLi, XSS, command injection). | Juice Shop es vulnerable a inyecciones. |
| **REQ-07** | V6.2.1 (Criptografía) | No almacenar contraseñas en texto plano; usar bcrypt o Argon2id. | Juice Shop usa MD5 (débil) por defecto. |
| **REQ-08** | V7.1.1 (Errores) | No exponer stack traces ni mensajes internos al usuario. | Los errores detallados filtran información. |
| **REQ-09** | V9.1.1 (Comunicación) | Usar TLS 1.2+ para todas las conexiones. | El contenedor debe servirse por HTTPS. |
| **REQ-10** | V11.1.1 (Lógica) | Prevenir ataques de flujo (precios negativos, cupones duplicados). | Juice Shop tiene fallos de lógica de negocio. |
| **REQ-11** | V12.1.1 (Archivos) | Restringir carga de archivos por tipo, tamaño y extensión. | Hay endpoints de upload vulnerables. |
| **REQ-12** | V13.1.1 (API) | Limitar métodos HTTP y validar `Content-Type` en la API. | Endurecer la API REST. |