# El Patito Feliz - Sistema de Órdenes 
Proyecto de arquitectura de Microservicios Dirigidos por Eventos para la gestión automatizada de ventas de accesorios tecnológicos. El sistema utiliza Apache Kafka como columna vertebral para comunicar la venta con la logística de envío de forma asíncrona.

# Estructura del Proyecto
/orders-service: API REST construida con Hono que actúa como Producer. Recibe compras y las publica en el topic compras-.

/logistics-service: Microservicio Consumer que escucha Kafka, genera números de guía automáticos (PAT-MX-XXXXXX) y calcula fechas de entrega.

/docs/brief.md: Documentación estratégica (Arquitectura, COBIT, NIST y Métricas DORA).

docker-compose.yml: Orquestación de la infraestructura de mensajería (Kafka + Zookeeper).

Tecnologías Usadas
Framework: Hono.dev 

Runtime: Node.js con tsx para ejecución directa de TypeScript.

Mensajería: Apache Kafka.

Contenedores: Docker & Docker Compose.

Guía de Inicio Rápido


1. Levantar la Infraestructura (Docker)
Desde la raíz del proyecto, ejecuta:

  ```Bash
   docker compose up -d
   ```
Ver en docker que los contenedores queden en estado up
  

2. Iniciar el Servicio de Órdenes
Abre una terminal y ejecuta:
```Bash
cd orders-service
npm install
npm run dev
El servidor subirá en http://localhost:3000.
```

3. Iniciar el Servicio de Logística (Consumer)
Abre una segunda terminal y ejecuta:

```Bash
cd logistics-service
npm install
npm run dev
```
Este servicio se quedará "escuchando" eventos de Kafka en tiempo real.

Cómo probar el sistema
Abre Postman.
Crea una petición POST a: http://localhost:3000/orden

En el Body, selecciona raw > JSON y pega:
```JSON
{
  "producto": "Teclado Mecánico RGB",
  "precio": 85.00,
  "cliente": "TuNombre"
}
```
Presiona Send.

Resultado: Verás la confirmación en Postman y, automáticamente, en la terminal de Logística aparecerá el ticket con su Número de Guía y Fecha Estimada de Entrega.

Solución de Problemas
Error de conexión a Kafka: Si el servicio de órdenes falla, asegúrate de que Kafka esté corriendo en Docker.

Zookeeper Not Ready: Kafka depende de Zookeeper. Si Kafka se apaga solo al inicio, reinicia con docker compose restart.