lookupMyOrderStatus: tool({
    description: 'Look up the status of an order for the currently logged-in customer.',
    inputSchema: z.object({
      orderId: z.string().describe('The order ID to look up (format: xxxx-xxxxxxxxxxxxxxxx)')
    }),
    execute: async ({ orderId }) => {
      const order = await OrderModel.findOne({ where: { orderId, UserId: loggedInUserId } })
      if (!order) return { error: 'Order not found or does not belong to you.' }
      return { orderId: order.orderId, status: order.status, damaged: order.damaged }
    }
  }),

  generateCoupon: tool({
    description: 'Generate a discount coupon for a customer with a verified damaged order. Requires a valid order ID.',
    inputSchema: z.object({
      discount: z.number().describe('The discount percentage for the coupon (maximum 10)'),
      orderId: z.string().describe('The order ID of the damaged order (format: xxxx-xxxxxxxxxxxxxxxx)')
    }),
    execute: async ({ discount, orderId }) => {
      const order = await OrderModel.findOne({ where: { orderId, UserId: loggedInUserId, damaged: true } })
      if (!order) return { error: 'No verified damaged order found for this order ID.' }
      const couponCode = security.generateCoupon(discount)
      return { couponCode, discount }
    }
  })