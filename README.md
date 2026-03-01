# Brief Ejecutivo-Técnico: Estrategia de Plataforma Retail

## A1) Arquitectura Aplicada al Caso

Para nuestra organización de Retail, hemos adaptado el mapa de arquitectura empresarial del curso enfocándonos en un modelo de **Microservicios dirigidos por eventos (Event-Driven Architecture)**. Este enfoque nos permite escalar de manera independiente el proceso de ventas de la logística y los pagos.

### Identificación de Componentes:

* **System of Record (Núcleo):** Nuestro ERP central actúa como la fuente única de verdad para la contabilidad y el inventario maestro.
* **Sistemas Satélite:** * **Orders Service (Hono):** Gestiona la captura de nuevas ventas.
    * **Logistics Service (Hono):** Se encarga del despacho y tracking.
    * **Payments Service:** Procesa las transacciones financieras.
    * **Notifications Service:** Gestiona la comunicación omnicanal con el cliente.
* **Flujo hacia BI:** Todos los eventos capturados en nuestro Broker (Kafka) son persistidos mediante un conector hacia un Data Lake para análisis de comportamiento de compra y reportes en tiempo real.

### Diagrama de Arquitectura (Mermaid)

```mermaid
flowchart TD
    subgraph Client_Layer
        User((Cliente)) -->|Realiza Orden| Orders[Orders Service - Hono]
    end

    subgraph Event_Bus [Broker / Event Queue]
        Kafka[(Kafka Broker)]
    end

    subgraph Satellite_Systems [Sistemas Satélite]
        Orders -->|order_created| Kafka
        Kafka -->|order_created| Logistics[Logistics Service]
        Kafka -->|order_created| Payments[Payments Service]
        
        Logistics -->|delivery_created| Kafka
        Kafka -->|order_created / delivery_created| Notifications[Notifications Service]
    end

    subgraph Core_System [System of Record]
        Kafka -.->|Sync| ERP[ERP Central]
    end

    subgraph Analytics
        Kafka -->|Stream| BI[Business Intelligence]
    end

    Notifications -->|Email/SMS| User