# Hito 1 · Diseño seguro

Copien esta carpeta a `docs/hito-1/` del repositorio de su aplicación y
completen cada sección. Borren las líneas que empiezan con *Instrucción*.

Integrantes y roles:

| Nombre | Rol |
|---|---|
| Andre Jo | Equipo rojo |
| Pedro Guzman | Equipo rojo |
| Isabella Miralles    | Equipo azul |
| Edwin Andres Ortega Kou | Equipo azul |

## DFD

<!--
*Instrucción: diagrama de flujo de datos de su aplicación, con los límites de
confianza marcados. Guarden la imagen en esta carpeta, por ejemplo como
`dfd.png`, y péguenla debajo.*
-->

![DFD de Juice Shop con límites de confianza](/docs/hito-1/assets/dfd_juice_shop.png)

## STRIDE

*Instrucción: una amenaza por letra. El componente es de su app, no un ejemplo
genérico.*

## STRIDE

*Instrucción: una amenaza por letra. El componente es de su app, no un ejemplo
genérico.*

| Letra | Amenaza | Componente | Control |
|---|---|---|---|
| Suplantación | Pasar como administrador sin conocer su contraseña, utilizando inyecciones SQL hacia el login o tomando el token JWT para hacer consultas. | Proceso 3 - Autenticación | Realizar consultas parametrizadas con Sequelize. Validar el formato del correo, verificar que la firma y el algoritmo del JWT sean correctos. Aplicar reglas en el WAF para SQL injection. |
| Manipulación | Modificar la información, por ejemplo reseñas. En Juice Shop se observa que no se necesita autenticación para editar una reseña. | Proceso 6 - Reseñas | Implementar autorización en la ruta y comprobar que el token sea del usuario que escribió la reseña. |
| Repudio | El usuario actúa y luego lo niega, porque los registros son incompletos o se pueden borrar o alterar. | Proceso 9 - Administración y logs | Logs de auditoría con usuario, IP y hora. |
| Divulgación de información | Se descargan archivos confidenciales que se extraen por medio de `/ftp`. | Proceso 7 - Subida de archivos | Límite de tamaño y desactivar entidades XML externas. Configurar reglas de ráfagas en el WAF. |
| Elevación de privilegios | Un usuario se puede registrar como administrador si cambia el rol a administrador. | Proceso 3 - Registro | Ignorar el campo `role` en el servidor y asignarlo siempre como "customer". |

## PASTA

*Instrucción: etapas 1 a 5. La etapa 5 reutiliza los hallazgos del Proyecto
DAST. Las etapas 6 y 7 se cierran en el Hito 2 y en el informe.*

### Etapa 1 · Objetivos del negocio

### Etapa 2 · Alcance técnico

### Etapa 3 · Descomposición de la aplicación

### Etapa 4 · Análisis de amenazas

### Etapa 5 · Vulnerabilidades

| Hallazgo (del DAST) | Dónde está | Relación con el DFD |
|---|---|---|
|  |  |  |

## Superficie de ataque

*Instrucción: la aporta el Equipo rojo. Rutas y métodos, roles, límites de
confianza (navegador, API, base de datos y el WAF) y los hallazgos del DAST que
van a convertirse en PoC del Hito 2. Si el puerto original de la app responde,
anótenlo aquí como bypass del WAF. Guarden el mapa en esta carpeta, por ejemplo
como `superficie.png`.*

## Requisitos de seguridad

*Instrucción: la columna «Control que lo comprueba» la llena el Equipo azul.
Escriban pipeline, regla de Kibana o WAF, y en la última columna cómo se va a
ver ese control en el Hito 2, 3 o 4.*

| ID | Requisito | Amenaza que cubre | Control que lo comprueba | Cómo se comprueba después |
|---|---|---|---|---|
| RS-01 |  |  |  |  |

## Casos de abuso

*Instrucción: al menos cinco, en formato Dado / Cuando / Entonces.*

### CA-01 ·

- **Dado**
- **Cuando**
- **Entonces**

### CA-02 ·

- **Dado**
- **Cuando**
- **Entonces**

### CA-03 ·

- **Dado**
- **Cuando**
- **Entonces**

### CA-04 ·

- **Dado**
- **Cuando**
- **Entonces**

### CA-05 ·

- **Dado**
- **Cuando**
- **Entonces**
