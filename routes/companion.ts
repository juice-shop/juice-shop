import type { Request, Response } from 'express'
import { DataTypes } from 'sequelize'

let OrganizationModel: any = null
let CompanionOrderModel: any = null
let AuditLogModel: any = null

// Define a safe, async initializer that guarantees the database tables exist on startup §9.3 & §12.2
async function initDatabaseModels (sequelize: any) {
  if (OrganizationModel && CompanionOrderModel && AuditLogModel) return

  // 1. Define Organization Schema with dynamic admin user fields
  OrganizationModel = sequelize.define('Organization', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    adminName: { type: DataTypes.STRING, allowNull: false },
    adminEmail: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'Organizations',
    timestamps: false
  })

  // 2. Define Companion Order Schema
  CompanionOrderModel = sequelize.define('CompanionOrder', {
    id: { type: DataTypes.STRING, primaryKey: true },
    organizationId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    subtotal_cents: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    tracking_marker: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'CompanionOrders',
    timestamps: false
  })

  // 3. Define Audit Log Schema for real database logging
  AuditLogModel = sequelize.define('AuditLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    timestamp: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'AuditLogs',
    timestamps: false
  })

  // 4. Sync Tables with SQLite
  await sequelize.sync()

  // 5. Seed default data dynamically on first-boot if empty
  const countOrgs = await OrganizationModel.count()
  if (countOrgs === 0) {
    await OrganizationModel.bulkCreate([
      { id: 'org-a', name: 'Northstar Retail', tenantId: 'tenant-genesis', adminName: 'Folajimi Aluko', adminEmail: 'aluko.folajimi@hayrok.com' },
      { id: 'org-b', name: 'Meridian Supply', tenantId: 'tenant-genesis', adminName: 'Supply Admin', adminEmail: 'admin@meridian.com' }
    ])
  }

  const countOrders = await CompanionOrderModel.count()
  if (countOrders === 0) {
    await CompanionOrderModel.bulkCreate([
      { id: 'order-a', organizationId: 'org-a', userId: 1, subtotal_cents: 2500, status: 'completed', tracking_marker: 'marker-northstar-123' },
      { id: 'order-b', organizationId: 'org-b', userId: 2, subtotal_cents: 4200, status: 'completed', tracking_marker: 'marker-meridian-456' }
    ])
  }

  const countLogs = await AuditLogModel.count()
  if (countLogs === 0) {
    await AuditLogModel.bulkCreate([
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), message: 'System started successfully' },
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), message: 'Loaded active configuration: commercehub' }
    ])
  }
}

interface OrderAccessProvider {
  getOrder: (orderId: string, context: { organizationId: string }) => Promise<any>
}

class SecureOrderAccessProvider implements OrderAccessProvider {
  async getOrder (orderId: string, context: { organizationId: string }) {
    const order = await CompanionOrderModel.findByPk(orderId)
    if (!order) return null
    // Strict multi-tenant boundary check (BOLA Prevention active)
    if (order.organizationId !== context.organizationId) {
      return null
    }
    return order.toJSON()
  }
}

class VulnerableOrderAccessProvider implements OrderAccessProvider {
  async getOrder (orderId: string, context: { organizationId: string }) {
    // Missing multi-tenant authorization check (BOLA Vulnerable)
    const order = await CompanionOrderModel.findByPk(orderId)
    return order ? order.toJSON() : null
  }
}

export function companionRoutes (app: any, sequelize: any) {
  // Safe initializer middleware to guarantee DB sync on first request
  app.use(async (req: Request, res: Response, next: any) => {
    try {
      await initDatabaseModels(sequelize)
      next()
    } catch (err) {
      next(err)
    }
  })

  // GET /api/v1/orders/:id
  app.get('/api/v1/orders/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const organizationId = req.headers['x-org-id'] as string || 'org-a'
    const scenarioState = req.headers['x-scenario-state'] as string || 'VULNERABLE'

    const provider: OrderAccessProvider = scenarioState === 'SECURE' 
      ? new SecureOrderAccessProvider() 
      : new VulnerableOrderAccessProvider()

    try {
      const order = await provider.getOrder(id, { organizationId })
      if (!order) {
        res.status(403).json({ error: 'Access Denied: BOLA prevention active or order not found' })
        return
      }
      res.json(order)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /api/v1/orders
  app.get('/api/v1/orders', async (req: Request, res: Response) => {
    try {
      const orders = await CompanionOrderModel.findAll()
      res.json(orders)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /api/v1/orders
  app.post('/api/v1/orders', async (req: Request, res: Response) => {
    const { subtotal_cents } = req.body
    if (!subtotal_cents) {
      res.status(400).json({ error: 'Missing subtotal_cents' })
      return
    }
    const orderId = `order-${Math.floor(Math.random() * 1000 + 100)}`
    const newOrder = {
      id: orderId,
      organizationId: 'org-a', // newly created orders belong to logged-in user's organization!
      userId: 1,
      subtotal_cents,
      status: 'completed',
      tracking_marker: `marker-northstar-${Math.floor(Math.random() * 900 + 100)}`
    }

    try {
      const order = await CompanionOrderModel.create(newOrder)
      res.status(201).json(order.toJSON())
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /api/v1/organizations
  app.get('/api/v1/organizations', async (req: Request, res: Response) => {
    try {
      const orgs = await OrganizationModel.findAll()
      res.json(orgs)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /api/v1/webhooks
  app.post('/api/v1/webhooks', (req: Request, res: Response) => {
    res.json({ status: 'SUCCESS', message: 'Webhook registered successfully' })
  })

  // GET /api/v1/admin/overview
  app.get('/api/v1/admin/overview', async (req: Request, res: Response) => {
    try {
      const totalOrders = await CompanionOrderModel.count()
      const revenue = await CompanionOrderModel.sum('subtotal_cents') || 0
      res.json({
        activeUsers: 42,
        totalOrders,
        revenueCents: revenue,
        tenant: 'CommerceHub Demo'
      })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /api/v1/audit-logs
  app.get('/api/v1/audit-logs', async (req: Request, res: Response) => {
    try {
      const logs = await AuditLogModel.findAll({ order: [['id', 'ASC']] })
      res.json(logs)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /api/v1/audit-logs
  app.post('/api/v1/audit-logs', async (req: Request, res: Response) => {
    const { message } = req.body
    if (!message) {
      res.status(400).json({ error: 'Missing message' })
      return
    }
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
    try {
      const log = await AuditLogModel.create({ timestamp, message })
      res.status(201).json(log.toJSON())
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })
}
