# Centralização do Tratamento de Logs de Erros - OWASP Juice Shop

Este documento descreve os passos para implementar um sistema centralizado de tratamento de logs de erros seguindo as diretrizes da OWASP para logging de aplicações web.

## Análise do Estado Atual

### Implementação Existente

A aplicação atualmente possui:

- **Logger centralizado**: `lib/logger.ts` usando Winston
- **Configuração básica**: Console transport apenas
- **Tratamento de erro disperso**: Diferentes padrões em `routes/`
- **Função utilitária**: `utils.getErrorMessage()` para padronização

### Problemas Identificados

1. **Logging inconsistente**: Diferentes padrões de error handling entre rotas
2. **Falta de estruturação**: Logs não estruturados para análise
3. **Ausência de contexto**: Informações de segurança e rastreamento limitadas
4. **Configuração limitada**: Apenas console transport, sem persistência
5. **Exposição de dados sensíveis**: Potencial vazamento de informações em error responses

## Diretrizes OWASP para Logging

### Princípios Fundamentais

1. **Log de eventos de segurança relevantes**
2. **Não logar dados sensíveis**
3. **Implementar integridade de logs**
4. **Configurar alertas para eventos críticos**
5. **Estruturar logs para análise e correlação**

## Plano de Implementação

### 1. Aprimorar o Logger Central

#### 1.1 Expandir configuração do Winston (`lib/logger.ts`)

```typescript
import * as winston from "winston";
import path from "path";

// Níveis customizados para segurança
const securityLevels = {
  levels: {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
  },
  colors: {
    emergency: "red",
    alert: "red",
    critical: "red",
    error: "red",
    warning: "yellow",
    notice: "blue",
    info: "green",
    debug: "grey",
  },
};

// Formato estruturado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      stack,
      ...meta,
    });
  })
);

const logger = winston.createLogger({
  levels: securityLevels.levels,
  format: logFormat,
  defaultMeta: {
    service: "juice-shop",
    version: process.env.npm_package_version,
  },
  transports: [
    // Console para desenvolvimento
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Arquivo para logs de erro
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Arquivo para logs de segurança
    new winston.transports.File({
      filename: path.join("logs", "security.log"),
      level: "warning",
      maxsize: 5242880,
      maxFiles: 10,
    }),

    // Arquivo combinado
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

winston.addColors(securityLevels.colors);

export default logger;
```

#### 1.2 Criar middleware de logging de erros (`lib/errorLogger.ts`)

```typescript
import { Request, Response, NextFunction } from "express";
import logger from "./logger";
import * as utils from "./utils";

export interface SecurityContext {
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  requestId: string;
}

export interface ErrorLogEntry {
  error: string;
  stack?: string;
  context: SecurityContext;
  route: string;
  method: string;
  statusCode: number;
  sensitive?: boolean;
}

export const extractSecurityContext = (req: Request): SecurityContext => {
  return {
    userId: req.user?.id?.toString(),
    userEmail: req.user?.email,
    ipAddress: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    sessionId: req.sessionID,
    requestId: req.id || crypto.randomUUID(),
  };
};

export const sanitizeError = (error: any): string => {
  // Remove dados sensíveis de senhas, tokens, etc.
  let errorMessage = utils.getErrorMessage(error);

  // Lista de padrões sensíveis para remover
  const sensitivePatterns = [
    /password[=:]\s*[^\s]+/gi,
    /token[=:]\s*[^\s]+/gi,
    /secret[=:]\s*[^\s]+/gi,
    /apikey[=:]\s*[^\s]+/gi,
    /authorization:\s*bearer\s+[^\s]+/gi,
  ];

  sensitivePatterns.forEach((pattern) => {
    errorMessage = errorMessage.replace(pattern, "[REDACTED]");
  });

  return errorMessage;
};

export const logSecurityEvent = (
  level: string,
  message: string,
  context: SecurityContext,
  additionalData?: any
) => {
  logger.log(level, message, {
    type: "security_event",
    ...context,
    ...additionalData,
  });
};

export const logError = (
  error: any,
  req: Request,
  statusCode: number = 500,
  sensitive: boolean = false
) => {
  const context = extractSecurityContext(req);
  const sanitizedError = sensitive
    ? "[SENSITIVE_ERROR_REDACTED]"
    : sanitizeError(error);

  const logEntry: ErrorLogEntry = {
    error: sanitizedError,
    stack: error.stack && !sensitive ? error.stack : undefined,
    context,
    route: req.route?.path || req.path,
    method: req.method,
    statusCode,
    sensitive,
  };

  // Log baseado na severidade
  if (statusCode >= 500) {
    logger.error("Server error occurred", logEntry);
  } else if (statusCode >= 400) {
    logger.warning("Client error occurred", logEntry);
  }

  // Log eventos de segurança críticos
  if (statusCode === 401 || statusCode === 403) {
    logSecurityEvent("alert", "Authentication/Authorization failure", context, {
      statusCode,
      route: req.path,
    });
  }
};

// Middleware para capturar erros não tratados
export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(err, req, res.statusCode || 500);
  next(err);
};
```

### 2. Implementar Padrões de Error Handling

#### 2.1 Criar classes de erro padronizadas (`lib/errors.ts`)

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly sensitive: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    sensitive: boolean = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.sensitive = sensitive;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true, false);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, true, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, true, false);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, true, true);
  }
}
```

#### 2.2 Criar helper para response de erros (`lib/errorResponse.ts`)

```typescript
import { Response } from "express";
import { AppError } from "./errors";

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    timestamp: string;
    requestId?: string;
  };
}

export const sendErrorResponse = (
  res: Response,
  error: AppError | Error,
  requestId?: string
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  // Não expor detalhes internos em produção
  const message =
    process.env.NODE_ENV === "production" && statusCode >= 500
      ? "Internal server error"
      : error.message;

  const errorResponse: ErrorResponse = {
    error: {
      message,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  res.status(statusCode).json(errorResponse);
};
```

### 3. Atualizar Rotas Existentes

#### 3.1 Padrão para rotas (`routes/example.ts`)

```typescript
import { Request, Response } from "express";
import { logError } from "../lib/errorLogger";
import { sendErrorResponse } from "../lib/errorResponse";
import { AppError, ValidationError } from "../lib/errors";

export function exampleRoute() {
  return async (req: Request, res: Response) => {
    try {
      // Validação de entrada
      if (!req.body.requiredField) {
        throw new ValidationError("Required field is missing");
      }

      // Lógica da rota...
      const result = await someAsyncOperation();

      return res.status(200).json({ data: result });
    } catch (error) {
      // Log do erro
      logError(error, req, error instanceof AppError ? error.statusCode : 500);

      // Response padronizada
      sendErrorResponse(res, error, req.id);
    }
  };
}
```

### 4. Configurar Middleware Global

#### 4.1 Atualizar server.ts

```typescript
import { errorLoggingMiddleware } from "./lib/errorLogger";
import { AppError } from "./lib/errors";
import { sendErrorResponse } from "./lib/errorResponse";

// ... outros middlewares

// Middleware de logging de erros (antes do error handler final)
app.use(errorLoggingMiddleware);

// Error handler global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Se response já foi enviado, delega para o Express
  if (res.headersSent) {
    return next(err);
  }

  sendErrorResponse(res, err, req.id);
});

// Handler para rotas não encontradas
app.use("*", (req: Request, res: Response) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  logError(error, req, 404);
  sendErrorResponse(res, error, req.id);
});
```

### 5. Implementar Monitoramento

#### 5.1 Alertas para eventos críticos (`lib/alerting.ts`)

```typescript
import logger from "./logger";
import { SecurityContext } from "./errorLogger";

export const sendSecurityAlert = (
  event: string,
  context: SecurityContext,
  severity: "low" | "medium" | "high" | "critical"
) => {
  logger.alert("Security alert triggered", {
    type: "security_alert",
    event,
    severity,
    ...context,
    timestamp: new Date().toISOString(),
  });

  // Em produção, integrar com sistemas de alertas
  // (email, Slack, PagerDuty, etc.)
};

// Detectar tentativas de ataque
export const detectSuspiciousActivity = (
  req: Request,
  attempts: number,
  timeWindow: number
) => {
  if (attempts > 5) {
    // Threshold configurável
    sendSecurityAlert(
      "Multiple failed attempts detected",
      extractSecurityContext(req),
      "high"
    );
  }
};
```

## Checklist de Implementação

### Fase 1: Infraestrutura Base

- [ ] Atualizar `lib/logger.ts` com configuração avançada
- [ ] Criar `lib/errorLogger.ts` com middleware de logging
- [ ] Implementar `lib/errors.ts` com classes de erro
- [ ] Criar `lib/errorResponse.ts` para responses padronizadas

### Fase 2: Integração

- [ ] Atualizar `server.ts` com middlewares globais
- [ ] Criar diretório `logs/` com permissões adequadas
- [ ] Configurar rotação de logs
- [ ] Implementar sanitização de dados sensíveis

### Fase 3: Atualização de Rotas

- [ ] Padronizar error handling em todas as rotas
- [ ] Substituir `console.log` por logger estruturado
- [ ] Implementar logging de eventos de segurança
- [ ] Adicionar contexto de rastreamento

### Fase 4: Monitoramento e Alertas

- [ ] Implementar sistema de alertas
- [ ] Configurar métricas de erro
- [ ] Criar dashboards de monitoramento
- [ ] Documentar procedimentos de resposta

## Configuração de Produção

### Variáveis de Ambiente

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_DIR=/var/log/juice-shop
ENABLE_SECURITY_ALERTS=true
ALERT_WEBHOOK_URL=https://hooks.slack.com/...
```

### Estrutura de Logs

```txt
logs/
├── error.log          # Erros 4xx/5xx
├── security.log       # Eventos de segurança
├── combined.log       # Logs gerais
└── access.log        # Logs de acesso (Morgan)
```

## Considerações de Segurança

1. **Proteção de dados sensíveis**: Nunca logar senhas, tokens, ou PII
2. **Integridade dos logs**: Implementar checksums ou assinatura digital
3. **Acesso restrito**: Logs devem ter permissões adequadas
4. **Retenção**: Definir políticas de retenção apropriadas
5. **Compliance**: Seguir regulamentações aplicáveis (LGPD, GDPR)

## Testing

Implementar testes para:

- Sanitização de dados sensíveis
- Estrutura correta dos logs
- Funcionamento dos alertas
- Error handlers globais
- Performance do logging

## Manutenção

- Revisar logs regularmente para padrões suspeitos
- Ajustar níveis de log conforme necessidade
- Atualizar filtros de sanitização
- Monitorar uso de disco pelos logs
- Validar eficácia dos alertas
