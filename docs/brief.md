# A1) Arquitectura aplicada al caso: "El Patito Feliz"

Para mi proyecto, elegí la empresa **"El Patito Feliz"**, que es un retail especializado en **accesorios de tecnología y gaming**. Por recomendación del ingeniero Yoel en las sesiones de arquitectura, decidimos movernos de un sistema donde todo dependía de una sola base de datos a uno **dirigido por eventos**. 

La meta es que el sistema sea asíncrono. Esto es clave para nosotros porque cuando lanzamos ofertas, el servidor de pagos a veces se satura; con esta arquitectura, la orden queda guardada en Kafka y se procesa en cuanto hay espacio, sin que el cliente vea un error en la pantalla.

## Componentes Clave:

* **System of Record (ERP Central):** Es nuestro núcleo "pesado". Aquí es donde vive la verdad sobre cuánto dinero tenemos y cuántos teclados o mouses quedan en bodega. Es el sistema que manda en las finanzas.
* **Sistemas Satélite (Los nuevos microservicios):**
    * **Orders (Hono):** Este recibe la compra. Valida que el usuario tenga sesión iniciada y que los datos de la orden estén bien antes de avisarle a los demás.
    * **Inventory & Logistics:** En lugar de ser solo logística, este servicio aparta el producto en el momento que llega el evento de "orden creada" para que no se lo vendamos a nadie más.
    * **Payments Gateway:** Se queda escuchando a Kafka y, cuando ve una orden nueva, dispara el cobro con la tarjeta del cliente.
    * **Customer Alert (Notifications):** Es nuestro servicio de atención. No solo manda correos, sino que confirma por SMS cuando el pago fue aceptado.
* **BI y Analítica:** Usamos los datos que viajan por Kafka para ver qué productos se venden más en ciertas horas y así planear las ofertas del mes.

## Diagrama de Arquitectura (Mermaid)
*Nota: He simplificado el flujo para que el Inventory y Payments trabajen en paralelo, mejorando la velocidad.*

```mermaid
graph LR
    subgraph App_Movil [Interfaz de Usuario]
        User((Gamer)) -->|Compra| OS[Orders Service]
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