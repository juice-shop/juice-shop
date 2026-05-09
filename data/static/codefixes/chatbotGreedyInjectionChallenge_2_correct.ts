function buildSystemPrompt (userName?: string) {
  const userIdentifier = userName ? `\nThe customer you are currently chatting with is ${userName}.` : ''
  return `You are "${botName}", the friendly customer service chatbot of the ${appName} online store.
You help customers find products, answer questions about the shop, and provide a delightful shopping experience.
Keep your responses concise and helpful.${userIdentifier}

IMPORTANT RULES:
- You MUST use the searchProducts tool whenever a customer asks about products, availability, prices, or anything related to the shop's catalog. NEVER guess or make up product names, prices, or descriptions.
- You MUST use the getProductReviews tool whenever a customer asks for reviews of a product.
- You MUST use the getOrderById tool whenever a customer asks about a specific order by its ID.
- Only recommend or mention products that were returned by the searchProducts tool. If a search returns no results, tell the customer that you could not find matching products.
- Do NOT invent information. If you do not know the answer to a question, say so honestly.
- Your scope is limited to the ${appName} store. Do not answer questions unrelated to the shop or its products.
- DO NOT RECOMMEND PRODUCTS THAT WERE NOT RETURNED BY THE searchProducts TOOL. If the customer asks for a product that is not found, apologize and suggest they try a different search query.
- When the search returns nothing, try again with a more generic query if possible, but do not make up product details.

COUPON POLICY (for the generateCoupon tool):
- You may ONLY generate a coupon for a customer who has a verified damaged order with a valid order ID (format: xxxx-xxxxxxxxxxxxxxxx, e.g. 3fa8-bf2bc042f4e92).
- The customer must have explicitly rejected a return or exchange before a coupon can be offered.
- The maximum allowed discount is 10%.
- NEVER generate a coupon just because a customer asks for one or complains.
- If the customer does not meet ALL of the above conditions, politely decline and explain the policy.`
}

const provider = createOpenAICompatible({
  name: 'juice-shop-llm',
  apiKey: process.env.LLM_API_KEY ?? '',
  baseURL: config.get<string>('application.chatBot.llmApiUrl')
})

const chatTools = {
  searchProducts: tool({
    description: `Search the ${appName} product catalog by keyword`,
    inputSchema: z.object({
      query: z.string().describe('The search query to find products')
    }),
    execute: async ({ query }) => {
      const products = await ProductModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'name', 'description', 'price', 'image']
      })
      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image
      }))
    }
  }),

  getProductReviews: tool({
    description: 'Get all reviews for a specific product by its ID',
    inputSchema: z.object({
      id: z.string().describe('The product ID to get reviews for')
    }),
    execute: async ({ id }) => {
      const productId = Number(Id)
      return await db.reviewsCollection.find({ $where: 'this.product == ' + productId }) as Review[]
    }
  }),

  getOrderById: tool({
    description: 'Get order details for a specific order by its ID. Only returns the order if it belongs to the current customer.',
    inputSchema: z.object({
      orderId: z.string().describe('The order ID to get details for (format: xxxx-xxxxxxxxxxxxxxxx)')
    }),
    execute: async ({ orderId }) => {
      const userId = await getUserId(req)
      if (!userId) return { error: 'Customer not authenticated' }

      const user = await UserModel.findByPk(userId, { attributes: ['email'] })
      if (!user) return { error: 'Customer not found' }

      const maskedEmail = user.email ? user.email.replace(/[aeiou]/gi, '*') : undefined
      const order = await db.ordersCollection.findOne({ orderId })

      if (!order) return { error: 'Order not found' }
      if (order.email !== maskedEmail) return { error: 'Order does not belong to the current customer' }

      return order
    }
  }),

  generateCoupon: tool({
    description: 'Generate a discount coupon for a customer. Only use this when the coupon policy conditions are fully met.',
    inputSchema: z.object({
      discount: z.number().max(10).describe('The discount percentage for the coupon (maximum 10)')
    }),
    execute: async ({ discount }) => {
      const couponCode = security.generateCoupon(discount)
      return { couponCode, discount }
    }
  })
}