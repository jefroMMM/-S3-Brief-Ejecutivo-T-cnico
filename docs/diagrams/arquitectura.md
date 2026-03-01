```mermaid
graph TD
    subgraph Cliente
        A[Postman / Usuario]
    end

    subgraph "Microservicio de Órdenes "
        B[API Endpoint /orden]
        C[Kafka Producer]
    end

    subgraph "Infraestructura (Docker)"
        D[(Broker Kafka)]
        E[Zookeeper]
    end

    subgraph "Microservicio de Logística "
        F[Kafka Consumer]
        G[Generador de Guía]
        H[Log en Consola]
    end

    A -- "POST {producto, precio, cliente}" --> B
    B --> C
    C -- "Publica Evento" --> D
    D -. "Coordina" .-> E
    D -- "Notifica Evento" --> F
    F --> G
    G --> H