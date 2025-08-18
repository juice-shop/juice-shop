# Materiais de Modelagem de Ameaças - OWASP Juice Shop

Este repositório contém materiais educacionais para ensino de modelagem de ameaças usando o OWASP Juice Shop como caso de estudo.

## 📁 Arquivos Incluídos

### 1. `threat-modeling-dfd.md`

#### Diagrama de Fluxo de Dados Completo

- DFD Nível 0 (Contexto)
- DFD Nível 1 (Decomposição detalhada)
- Análise STRIDE por componente
- Fronteiras de confiança
- Vulnerabilidades do OWASP Top 10
- Controles de segurança recomendados

**Uso**: Material de referência completo para instrutores e estudantes avançados.

### 2. `dfd-aula-seguranca.md`

**Diagrama Simplificado para Apresentações**

- Diagramas otimizados para slides
- Cenários de ataque práticos
- Exercícios por nível de dificuldade
- Métricas de segurança
- Superfície de ataque visual

**Uso**: Apresentações em sala de aula, workshops, demonstrações.

### 3. `stride-threat-analysis.md`

**Análise STRIDE Detalhada**

- Metodologia STRIDE aplicada sistematicamente
- Matriz de risco por componente
- Mapeamento para OWASP Top 10
- Plano de mitigação prioritário
- Ferramentas recomendadas

**Uso**: Treinamento avançado em modelagem de ameaças, análise de risco.

## 🎯 Objetivos de Aprendizado

### Para Estudantes

- Compreender os conceitos de Diagrama de Fluxo de Dados (DFD)
- Aplicar a metodologia STRIDE para identificação de ameaças
- Reconhecer vulnerabilidades comuns em aplicações web
- Desenvolver pensamento crítico sobre segurança de software
- Praticar análise de risco e priorização de mitigações

### Para Instrutores

- Material estruturado para diferentes níveis de ensino
- Exemplos práticos baseados em vulnerabilidades reais
- Exercícios progressivos (iniciante → avançado)
- Recursos visuais para melhor compreensão
- Conexão entre teoria e prática

## 🚀 Como Usar Este Material

### 1. Preparação da Aula

#### Pré-requisitos

- OWASP Juice Shop instalado e funcionando
- Conhecimento básico de aplicações web
- Familiaridade com conceitos de segurança

#### Configuração

```bash
# Clonar o Juice Shop
git clone https://github.com/juice-shop/juice-shop.git
cd juice-shop

# Instalar dependências
npm install

# Executar a aplicação
npm start
```

### 2. Sequência Sugerida de Ensino

#### Aula 1: Introdução à Modelagem de Ameaças (2h)

- **Conceitos**: DFD, STRIDE, fronteiras de confiança
- **Material**: `dfd-aula-seguranca.md` (seções 1-3)
- **Prática**: Identificar componentes do Juice Shop
- **Exercício**: Desenhar DFD Nível 0 manualmente

#### Aula 2: Identificação de Ameaças (2h)

- **Conceitos**: Metodologia STRIDE
- **Material**: `stride-threat-analysis.md` (seções 1-2)
- **Prática**: Aplicar STRIDE a um componente
- **Exercício**: Completar análise de autenticação

#### Aula 3: Análise de Vulnerabilidades (2h)

- **Conceitos**: OWASP Top 10, superfície de ataque
- **Material**: `dfd-aula-seguranca.md` (seções 4-6)
- **Prática**: Explorar vulnerabilidades no Juice Shop
- **Exercício**: Executar ataques básicos (SQL injection, XSS)

#### Aula 4: Avaliação de Risco (2h)

- **Conceitos**: Matriz de risco, priorização
- **Material**: `stride-threat-analysis.md` (seções 3-4)
- **Prática**: Calcular risk scores
- **Exercício**: Criar plano de mitigação

#### Aula 5: Controles de Segurança (2h)

- **Conceitos**: Prevenção, detecção, resposta
- **Material**: `threat-modeling-dfd.md` (seção final)
- **Prática**: Implementar controles simples
- **Exercício**: Projeto final - análise completa

### 3. Exercícios Práticos

#### Nível Iniciante

```markdown
1. **Identificação de Componentes**

   - Liste todos os componentes visíveis na interface
   - Identifique os fluxos de dados entre eles
   - Desenhe um DFD básico

2. **Reconhecimento de Vulnerabilidades**

   - Teste formulários com entradas especiais
   - Observe mensagens de erro
   - Documente comportamentos anômalos

3. **Análise STRIDE Básica**
   - Escolha um componente simples (ex: login)
   - Aplique cada letra do STRIDE
   - Identifique pelo menos uma ameaça
```

#### Nível Intermediário

```markdown
1. **Exploração de Vulnerabilidades**

   - Execute ataques de SQL injection
   - Teste bypass de autenticação
   - Explore upload de arquivos

2. **Análise de Impacto**

   - Classifique vulnerabilidades por severidade
   - Calcule risk scores usando a matriz
   - Justifique suas avaliações

3. **Mapeamento OWASP Top 10**
   - Identifique exemplos de cada categoria
   - Relacione com componentes do DFD
   - Proponha mitigações específicas
```

#### Nível Avançado

```markdown
1. **Modelagem Completa**

   - Crie DFD completo (Níveis 0 e 1)
   - Análise STRIDE sistemática
   - Matriz de risco detalhada

2. **Cadeia de Ataques**

   - Combine múltiplas vulnerabilidades
   - Demonstre escalação de privilégios
   - Simule ataques complexos

3. **Plano de Segurança**
   - Desenvolva estratégia de mitigação
   - Priorize implementações
   - Calcule custo-benefício
```

## 🛠 Ferramentas Recomendadas

### Para Visualização de Diagramas

- **Draw.io**: Editor online gratuito
- **Lucidchart**: Ferramenta profissional
- **Microsoft Visio**: Software empresarial
- **Mermaid**: Diagramas como código (usado neste material)

### Para Teste de Vulnerabilidades

- **OWASP ZAP**: Scanner de segurança gratuito
- **Burp Suite**: Proxy para testes manuais
- **Postman**: Testes de API
- **Browser DevTools**: Inspeção de requisições

### Para Análise de Código

- **SonarQube**: Análise estática gratuita
- **ESLint**: Linting para JavaScript/TypeScript
- **Bandit**: Scanner para Python
- **Semgrep**: Análise semântica multi-linguagem

## 📊 Avaliação e Feedback

### Critérios de Avaliação

1. **Compreensão Conceitual (25%)**

   - Definições corretas
   - Aplicação adequada da metodologia
   - Identificação de fronteiras de confiança

2. **Análise Técnica (35%)**

   - Qualidade do DFD
   - Completude da análise STRIDE
   - Precisão na identificação de vulnerabilidades

3. **Avaliação de Risco (25%)**

   - Classificação adequada de severidade
   - Justificativas consistentes
   - Priorização lógica

4. **Mitigações Propostas (15%)**
   - Relevância das soluções
   - Viabilidade técnica
   - Considerações de custo-benefício

### Rubrica de Avaliação

| Critério             | Excelente (4)                       | Bom (3)                         | Satisfatório (2)        | Insatisfatório (1)      |
| -------------------- | ----------------------------------- | ------------------------------- | ----------------------- | ----------------------- |
| **DFD**              | Completo, preciso, bem estruturado  | Correto com pequenos erros      | Básico mas funcional    | Incompleto ou incorreto |
| **STRIDE**           | Análise sistemática e abrangente    | Boa análise com lacunas menores | Análise básica adequada | Análise superficial     |
| **Vulnerabilidades** | Identificação precisa e detalhada   | Boa identificação               | Identificação básica    | Identificação incorreta |
| **Risco**            | Avaliação sofisticada e justificada | Boa avaliação                   | Avaliação simplificada  | Avaliação inadequada    |

## 🔗 Recursos Adicionais

### Documentação Oficial

- [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)
- [Microsoft STRIDE](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [OWASP Juice Shop Guide](https://pwning.owasp-juice.shop/)

### Cursos Online

- [Coursera - Cybersecurity Specialization](https://www.coursera.org/specializations/cyber-security)
- [Cybrary - Threat Modeling](https://www.cybrary.it/course/threat-modeling/)
- [SANS - Secure Coding](https://www.sans.org/cyber-security-courses/web-app-penetration-testing-ethical-hacking/)

### Livros Recomendados

- "Threat Modeling: Designing for Security" - Adam Shostack
- "The Web Application Hacker's Handbook" - Dafydd Stuttard
- "Secure Coding: Principles and Practices" - Mark Graff

## 🤝 Contribuições

Este material está em constante evolução. Contribuições são bem-vindas:

1. **Melhorias nos Diagramas**: Sugestões para clareza visual
2. **Exercícios Adicionais**: Novos cenários de prática
3. **Correções**: Erros técnicos ou conceituais
4. **Traduções**: Versões em outros idiomas
5. **Feedback de Uso**: Experiências em sala de aula

## 📝 Licença

Este material está disponível sob licença MIT, permitindo uso livre para fins educacionais e comerciais com atribuição adequada.

---

**Desenvolvido para fins educacionais** | **OWASP Juice Shop é uma aplicação intencionalmente vulnerável**
