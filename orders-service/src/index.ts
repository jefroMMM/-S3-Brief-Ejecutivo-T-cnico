import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Kafka } from 'kafkajs'

const app = new Hono()

const kafka = new Kafka({
  clientId: 'orders-service',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
})

const producer = kafka.producer()

app.get('/', (c) => c.text('API de Órdenes del Patito Feliz lista! 🦆'))

app.post('/orden', async (c) => {
    try {
      const body = await c.req.json().catch(() => null);
      
      if (!body) {
        return c.json({ error: "El cuerpo de la petición está vacío o no es JSON válido" }, 400);
      }
  
      const { producto, precio, cliente } = body;
  
      await producer.connect();
      await producer.send({
        topic: 'compras-gaming',
        messages: [
          { value: JSON.stringify({ producto, precio, cliente, timestamp: new Date() }) }
        ],
      });
      
      console.log(`Orden enviada a Kafka: ${producto}`);
      return c.json({ mensaje: "Orden enviada a Kafka", cliente });
  
    } catch (error) {
      console.error(' Error real:', error);
      return c.json({ error: 'Fallo en el proceso', details: error.message }, 500);
    }
  })

serve({ fetch: app.fetch, port: 3000 })