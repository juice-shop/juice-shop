# Diagrama de Flujo de Datos (DFD) y Límites de Confianza

Este DFD de Nivel 1 ilustra cómo fluye la información desde el usuario hasta los almacenes de datos, identificando las fronteras donde la confianza cambia (Trust Boundaries). Los datos que cruzan un límite de confianza son los puntos de mayor riesgo y donde se enfocará el análisis STRIDE.

## DFD con Límites de Confianza

```mermaid
flowchart TD
    %% Actores
    U([Usuario / Navegador])
    ADM([Administrador])

    %% Límite 1
    subgraph L1 [Límite 1: Zona No Confiable - Navegador]
        FE[Frontend Angular]
    end

    %% Límite 2
    subgraph L2 [Límite 2: Zona Confiable - Backend]
        API[API REST / Node.js]
        AUTH[Servicio de Autenticación JWT]
    end

    %% Límite 3
    subgraph L3 [Límite 3: Zona Protegida - Datos]
        DB[(SQLite)]
        MARS[(MarsDB)]
    end

    %% Flujos
    U -->|Ingresa credenciales| FE
    ADM -->|Administra productos| FE
    FE -->|Petición HTTP con datos| API
    API -->|Valida token| AUTH
    API -->|Consulta/Insertar| DB
    API -->|Lee/Escribe| MARS
    DB -->|Devuelve perfil| API
    API -->|Respuesta JSON| FE

    %% Estilos de límites
    style L1 fill:#ffcccc,stroke:#ff0000,stroke-dasharray: 5 5
    style L2 fill:#ccffcc,stroke:#00ff00,stroke-dasharray: 5 5
    style L3 fill:#ccccff,stroke:#0000ff,stroke-dasharray: 5 5
```
| Origen | Destino | Dato que viaja | Amenaza potencial (STRIDE) |
| :--- | :--- | :--- | :--- |
| Usuario | Frontend | Credenciales (Email/Pass) | **Spoofing:** Robo de credenciales si no hay HTTPS. |
| Frontend | API REST | Petición HTTP (JSON) | **Tampering:** Modificar el JSON para inyectar SQL o cambiar precios. |
| API REST | SQLite | Consulta SQL | **Information Disclosure:** Si la consulta no está parametrizada, un atacante puede leer toda la base de datos. |
| API REST | Frontend | Respuesta JSON (Perfil) | **XSS:** Si el nombre del usuario se devuelve sin escapar, se ejecuta código malicioso en el navegador. |
| Usuario (Normal) | API REST | Petición a ruta de Admin | **Elevation of Privilege:** Saltarse el frontend y llamar directo a la API para hacerse admin. |