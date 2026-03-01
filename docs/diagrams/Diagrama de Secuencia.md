```mermaid
sequenceDiagram
    participant U as Postman
    participant O as Orders Service
    participant K as Kafka Broker
    participant L as Logistics Service

    U->>O: POST /orden (JSON)
    Note over O: Valida datos
    O->>K: Enviar mensaje (compras-gaming)
    K-->>O: Confirmación (ACK)
    O-->>U: 200 OK (Orden Recibida)
    
    Note over K: El mensaje está en la cola
    
    K->>L: Entrega mensaje
    Note over L: Procesa lógica de negocio
    L->>L: Generar Guía: PAT-MX-XXXX
    L->>L: Calcular Fecha Entrega
    Note right of L: Log: Orden procesada