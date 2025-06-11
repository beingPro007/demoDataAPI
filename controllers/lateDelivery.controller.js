// cronJobs/lateOrderQueue.js
import cron from 'node-cron';
import amqp from 'amqplib';
import { Order } from '../models/order.model.js';

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'late-orders';

export const startLateOrderCron = () => {
    cron.schedule('*/10 * * * *', async () => {
        console.log("🔁 Running late order check...");

        try {
            const lateOrders = await Order.find({
                expectedDeliveryDate: { $lt: new Date() },
                status: { $ne: 'delivered' },
            });

            if (!lateOrders || lateOrders.length === 0) {
                console.log("✅ No late orders found.");
                return;
            }

            const conn = await amqp.connect(RABBITMQ_URL);
            const channel = await conn.createChannel();
            await channel.assertQueue(QUEUE_NAME);

            for (const order of lateOrders) {
                const message = {
                    orderId: order.orderID,
                    prodName: order.prodName,
                    phoneNumber: 'USER_PHONE_NUMBER', // TODO: Replace dynamically
                    expectedDeliveryDate: order.expectedDeliveryDate,
                    shippingAddress: order.shippingAddress,
                };

                channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
                console.log(`[+] Enqueued late order #${order.orderID}`);
            }

            await channel.close();
            await conn.close();
            console.log("✅ Done processing late orders.");
        } catch (err) {
            console.error("❌ Error in cron job:", err);
        }
    });
};
