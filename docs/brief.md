# A1) Arquitectura aplicada al caso: "El Patito Feliz"

Para mi tarea, elegí la empresa **"El Patito Feliz"**, que es un retail especializado en **accesorios de tecnología**. Por recomendación del ingeniero Yoel en las clases de TI, decidimos movernos de un sistema donde todo dependía de una sola base de datos a uno **dirigido por eventos**. 

La meta es que el sistema sea asíncrono. Esto es clave para nosotros porque cuando lanzamos ofertas, el servidor de pagos a veces se satura; con esta arquitectura, la orden queda guardada en Kafka y se procesa en cuanto hay espacio, sin que el cliente vea un error en la pantalla.

# Componentes Clave:

* **ERP Central:** que es mi núcleo pesado. Aquí es donde vive la verdad sobre cuánto dinero tenemos y cuántos teclados o mouses quedan en bodega. Es el sistema que manda en las finanzas.
* **Sistemas Satélite (Los nuevos microservicios):**
    * **Orders:** Este recibe las intensiones del usuario las cuales son realizar una orden validando datos recibidos por el usuario
    * **Inventory & Logistics:** Procesa el evento de orden creada y reserva el producto para esa orden en especifico
* **BI y Analítica:** Para Bi se utilizan los datos que pasan por el bus de kafka para que podamos ver cuales son los productos que se venden más y otras metricas


## Diagrama de Arquitectura (Mermaid)

```mermaid
graph LR
    subgraph App_Movil [Interfaz de Usuario]
        User((Cliente)) -->|Compra| OS[Orders Service]
    end

    subgraph Bus_Eventos [Kafka]
        K((Broker Central))
    end

    OS -->|evento: nueva_compra| K

    subgraph Servicios_Satelite [Procesamiento]
        K --> PAY[Payments Service]
        K --> LOG[Logistics & Inv]
        K --> NOT[Notifications]
    end

    subgraph Respaldo [Core]
        K -.->|Update| ERP[(ERP Centralizado)]
        K -.->|Logs| BI[(Data Warehouse)]
    end
```

# A2) Gobierno de TI (COBIT — Mínimo Viable)
En El Patito Feliz, Queremos un sistema en el cual cada usuario tendrá un rol especifico al mismo tiempo que permisos por eso utilizamos COBIT para que los usuarios tengan reglas que seguir


Roles y Responsabilidades
La Gerencia (Dirección): Son las personas que nos autorizan presupuestos y ponen reglas especificias sobre el sistema

Equipo de TI: somos quienes nos encargamos de levantar servicios basados en hono y como broker kafka y hacer que no se caigan o poder levantarlos

Seguridad informatica: Las personas encargadas de que nuestro sistema no sea vulnerado ante amenazas externas o internas para cuidar credenciales y la confidencialidad de todos los datos. 

Dueño del Proceso: Son quienes ya interactuan con el proceso de forma fisica ya que de ellas nos dirán si el flujo del programa es el correcto y si el programa cumple con las necesidades

6 Decisiones que tenemos bajo control
Estas cosas no se deciden "a lo loco", tienen que pasar por un filtro:

¿Quién tiene la razón?: El ERP siempre tiene la última palabra sobre cuánto stock queda de un producto o cuales son las ganancias de la empresa

Cambios en el código:No se puede actualizar el código de producción sin que el equipo y gerencia lo valide

Accesos: Solo el equipo de programación y el de seguridad puede ver o editar el código y ver el trafico de kafka 

Backups:Nosotros realizaremos un backup minimo 2 veces durante el día y un backup de forma automatica durante la madrugada donde el trafico es más bajo

Nuevos Proveedores: El equipo de TI y administración se discuiran sobre si se utilizaran nuevos proveedores de servicios como los servidores ya sean en la nube o tener uno propio

Formato de datos: Todos los microservicios tendremos que utilzar un formato estandar para la comunicación de los mismos que será formato JSON

5 Políticas 
Seguridad de entrada:Para cualquier sistema se tiene que utilizar los distintos factores de autenticación al sistema de forma obligatoria para evitar robo de credenciales o usurpación de indentidad

Cero cambios directos: Prohibido aplicar cambios de forma directa al main ya que primero debemos de probar los cambios en una copia del sistema para validar que funcione

Respaldo real:Pruebas de restauración una vez a la semana o dos semanas debemos de probar la restauración de la base de datos para asegurarnos que el ERP para ver que de verdad funcione y los datos se mantengan actualizados

¿Qué hacer si algo falla?: Sí algún servicio o Kafka o el ERP no funcionan se debe de comunidar con el equipo o el encargado de dicha de dicho servicio y solo a ellos para poder restablecer el servicio

Revisión de proveedores: Se debe de revisar cada cierto tiempo de la mano con el equipo de gerencia para ver si sigue siendo viable o si los proveedores siguendo siendo necesarios, seguros o confiables


# A3) Riesgo y Seguridad (NIST CSF 2.0)

En **El Patito Feliz**, no solo nos importa vender, sino que los datos de nuestros clientes estén a salvo. Usamos el marco de **NIST CSF 2.0** para estrar actualizados en los nuevos terminos y estandares de seguridad


### Cuadro: Perfil Actual vs. Perfil Objetivo

| Función | Perfil Actual | Perfil Objetivo  |
| :--- | :--- | :--- |
| **Govern** | Decisiones de seguridad se toman "en el camino". | Políticas escritas y revisadas cada 6 meses por la gerencia. |
| **Identify** | Sabemos qué servidores hay, pero no todos los datos que pasan. | Inventario completo de activos y mapeo total de eventos en Kafka. |
| **Protect** | Usamos contraseñas, pero no en todo lado hay doble factor. | **MFA obligatorio** para entrar al ERP y cifrado de datos sensibles. |
| **Detect** | Nos damos cuenta de fallos si alguien se queja en soporte. | Alertas automáticas que nos avisan si un servicio de Hono se cae. |
| **Respond** | Resolvemos los problemas como van saliendo . | Plan de respuesta con pasos claros y gente asignada a cada servicio. |
| **Recover** | Hacemos backups del ERP, pero no siempre probamos si funcionan. | Recuperación probada una vez por semana o cada dos semanas para asegurar que no perdemos ventas. |

### 6 Controles Priorizados

| Control | Justificación (Impacto / Viabilidad) |
| :--- | :--- |
| **1. Doble Factor (MFA)** | **Impacto Alto:** Detiene casi cualquier intento de entrar a nuestras cuentas. **Viabilidad:** Muy fácil de poner. |
| **2. Cifrado de Datos** | **Impacto Alto:** Si alguien se mete, los datos de los pagos son ilegibles. **Viabilidad:** Requiere un poco de configuración. |
| **3. Alertas en Kafka** | **Impacto Medio:** Nos avisa si hay mucha carga antes de que el sistema explote. **Viabilidad:** Muy alta. |
| **4. Auditoría de Logs** | **Impacto Medio:** Nos permite investigar qué pasó después de un error raro. **Viabilidad:** Alta. |
| **5. Escaneo de Código** | **Impacto Alto:** Revisa que el código de Hono no tenga "agujeros" por donde entrar. **Viabilidad:** Media. |
| **6. Simulacro de Restauración** | **Impacto Crítico:** Es lo único que nos salva de perder el negocio si el ERP muere. **Viabilidad:** Media. |

### Mini Plan de Respuesta a Incidentes 

Si algo sale mal en la infraestructura de "El Patito Feliz", seguimos este plan basado en NIST IR:

1. **Detección y Análisis:** Identificamos rápido qué falló. ya sea algún microservicio o es **Kafka** Avisamos al equipo de TI por el grupo de emergencia de inmediato.
2. **Contención y Limpieza:** Si un servicio está fallando o bajo ataque, lo aislamos lo desconectamos del bus de Kafka de eventos para que no afecte al resto de la tienda. Arreglamos el problema de raíz.
3. **Vuelta a la Normalidad:** Restauramos el servicio afectado usando el último backup seguro y nos sentamos a anotar qué aprendimos para que no nos vuelva a pasar.

# A4) Métricas (DORA + Operación)

Para que el ingeniero Yoel y la gerencia de **El Patito Feliz** vean que el sistema funciona, vamos a medir el éxito con estos 4 indicadores clave:

### 1. Deployment Frequency (DORA - Entrega)
* **Definición:** ¿Qué tan seguido subimos cambios o nuevas funciones a producción?
-Esto no mide nuestra efectividad pero para cumplir con requirimientos de aministración necesitamos tres dos deploys por semana
* **Por qué importa:** Demostramos que podemos desarrollar e implementar de forma frecuente, que tenemos una buena metodología y hay buena cordinación
* **Cómo la mediría:** La medición se basa en cuantos deploys resultan en exito y no presentan fallos una vez en producción

### 2. Change Failure Rate (DORA - Mejora)
* **Definición:** ¿Qué porcentaje de los cambios que subimos terminan fallando o requieren un "hotfix" urgente?
* **Por qué importa:** No sirve de nada subir cosas rápido si todo llega roto. Queremos velocidad, pero con calidad.
* **Cómo la mediría:** Dividiendo el número de despliegues que causaron un incidente entre el total de despliegues realizados en el mes.

### 3. Uptime / Disponibilidad (Operativa)
* **Definición:** El porcentaje de tiempo que el sistema (especialmente Kafka y el ERP) está en línea y recibiendo órdenes.
* **Por qué importa:** Si la tienda está caída, un gamer no puede comprar su teclado y perdemos dinero. Nuestra meta es el "99.9% de disponibilidad".
* **Cómo la mediría:** Usando una herramienta de monitoreo que mande un "ping" cada minuto a nuestros servicios y reporte si respondieron correctamente (HTTP 200).

### 4. Mean Time to Recover - MTTR (Seguridad/Operación)
* **Definición:** ¿Cuánto tiempo tardamos, en promedio, desde que algo falla hasta que el servicio vuelve a estar normal?
* **Por qué importa:** Los fallos van a ocurrir, lo importante es qué tan rápido reaccionamos para que el cliente ni se de cuenta.
* **Cómo la mediría:** Registrando la hora en que salta una alerta de incidente y la hora en que se marca como "resuelto" en nuestro log de errores.


