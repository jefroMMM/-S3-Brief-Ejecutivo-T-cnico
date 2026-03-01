import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'logistics-service',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'logistics-group' })

const generarNumeroGuia = () => `PAT-MX-${Math.floor(100000 + Math.random() * 900000)}`;

const calcularFechaEntrega = () => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 3);
  return fecha.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'compras-gaming', fromBeginning: false })

  console.log('🚛 [LOGÍSTICA] Sistema de Tracking activado. Esperando órdenes...');

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString()
      const order = JSON.parse(value || '{}')
      
      const trackingId = generarNumeroGuia();
      const fechaEstimada = calcularFechaEntrega();

      console.log('==================================================')
      console.log(`📦 ¡ORDEN PROCESADA PARA ENVÍO!`)
      console.log(`🎮 Producto: ${order.producto}`)
      console.log(`👤 Cliente:  ${order.cliente}`)
      console.log(`🆔 Guía No:  ${trackingId}`)
      console.log(`📅 Entrega:  ${fechaEstimada}`)
      console.log('--------------------------------------------------')
      console.log('🦆💨 El patito repartidor ha salido del almacén.')
    },
  })
}

run().catch(console.error)