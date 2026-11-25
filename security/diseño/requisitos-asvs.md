# Requisitos de Seguridad (OWASP ASVS v4.0.3)

**Proyecto:** OWASP Juice Shop - Ciclo de Desarrollo Seguro (SSDLC)
**Autoras:** Gabriela Navarro y Sandra Soria
**Fecha:** Noviembre 2026
**Versión:** 1.0
**Fase:** Fase 1 - Diseño de la Aplicación

---

Basado en el Nivel 1 y 2 de OWASP ASVS, estos son los requisitos mínimos que el equipo buscará verificar y que servirán como base para el modelo de amenazas.

| ID | Categoría ASVS | Requisito Técnico | Justificación en Juice Shop |
| :--- | :--- | :--- | :--- |
| **REQ-01** | V2.1.1 (Autenticación) | Las contraseñas deben tener mínimo 12 caracteres y no estar en diccionarios comunes. | Juice Shop permite crear usuarios con contraseñas débiles como "123456". |
| **REQ-02** | V2.2.1 (Autenticación) | Bloquear la cuenta tras 5 intentos fallidos de inicio de sesión. | No existe protección contra ataques de fuerza bruta en el login. |
| **REQ-03** | V3.4.1 (Sesión) | Las cookies de sesión deben tener el atributo `Secure` (solo viajan por HTTPS). | Previene la intercepción del token en redes no seguras. |
| **REQ-04** | V3.4.2 (Sesión) | Las cookies de sesión deben tener el atributo `HttpOnly`. | Previene el robo del token mediante ataques XSS. |
| **REQ-05** | V4.1.1 (Control de acceso) | Validar permisos en el backend (servidor) para cada endpoint, no solo ocultar botones en el frontend. | Juice Shop es famoso por permitir a usuarios normales acceder a rutas de administrador. |
| **REQ-06** | V5.1.1 (Validación) | Sanitizar y escapar toda entrada de usuario para prevenir inyecciones SQL y XSS. | La aplicación sufre de inyecciones SQL en el login y búsquedas. |
| **REQ-07** | V6.2.1 (Criptografía) | Usar algoritmos de hashing fuertes (bcrypt, Argon2) para contraseñas. | El proyecto original usa MD5, que es vulnerable a ataques de colisión. |
| **REQ-08** | V7.1.1 (Errores) | No mostrar "Stack Traces" (errores de código) ni rutas internas del servidor al usuario final. | Los errores detallados facilitan la fase de reconocimiento a un atacante. |
| **REQ-09** | V9.1.1 (Comunicación) | Forzar el uso de TLS 1.2 o superior para todas las conexiones. | El despliegue local por defecto usa HTTP en el puerto 3000. |
| **REQ-10** | V11.1.1 (Lógica) | Validar la lógica de negocio (ej. evitar precios negativos o cupones duplicados). | Juice Shop tiene retos que explotan fallos en el carrito de compras. |
| **REQ-11** | V12.1.1 (Archivos) | Restringir la subida de archivos por tipo, tamaño y validar su contenido. | Hay endpoints para subir fotos de perfil que pueden ser explotados. |
| **REQ-12** | V13.1.1 (API) | Validar el formato `Content-Type` y limitar los métodos HTTP permitidos en la API. | Endurecer las peticiones REST del backend. |