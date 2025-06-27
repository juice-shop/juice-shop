# OWASP Juice Shop Dev Container

This dev container provides a complete development environment for OWASP Juice Shop with all necessary tools and dependencies pre-configured.

## What's Included

### Base Image
- **Node.js 20** - Latest LTS version as specified in package.json
- **Git** - For version control
- **GitHub CLI** - For GitHub integration

### VS Code Extensions
- **Angular Language Service** - Angular development support
- **ESLint** - JavaScript/TypeScript linting
- **Stylelint** - CSS/SCSS linting
- **TypeScript** - TypeScript language support
- **Prettier** - Code formatting
- **JSON** - JSON language support

### Pre-configured Settings
- ESLint auto-fix on save
- Prettier formatting on save
- TypeScript auto-imports from package.json
- Proper working directories for ESLint

### Port Forwarding
- **Port 3000** - Juice Shop backend server
- **Port 4200** - Angular development server

## Getting Started

1. **Open in Dev Container**
   - Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code
   - Open this project in VS Code
   - When prompted, click "Reopen in Container" or use `Ctrl/Cmd + Shift + P` and select "Dev Containers: Reopen in Container"

2. **Automatic Setup**
   - The container will automatically run the setup script (`.devcontainer/setup.sh`)
   - This installs all dependencies and builds the project
   - You'll see progress messages in the terminal

3. **Start Development**
   - Run `npm start` to start the application
   - Run `npm run serve:dev` for development mode with hot reload
   - Access the application at http://localhost:3000

## Available Scripts

Based on the project's package.json, you can use these commands:

### Development
- `npm start` - Start the production application
- `npm run serve` - Start both backend and frontend in development mode
- `npm run serve:dev` - Start with hot reload for backend changes

### Testing
- `npm test` - Run all tests (frontend + backend)
- `npm run test:server` - Run only backend tests
- `npm run test:api` - Run API tests
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests

### Code Quality
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues automatically

### Building
- `npm run build:frontend` - Build the Angular frontend
- `npm run build:server` - Build the TypeScript backend

## Project Structure

```
juice-shop/
├── frontend/          # Angular application
├── routes/           # Express.js routes
├── models/           # Data models
├── lib/              # Utility libraries
├── data/             # Static data and configurations
├── test/             # Test files
└── views/            # Server-side templates
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - The container forwards ports 3000 and 4200
   - Make sure these ports are not used by other applications on your host machine

2. **Permission issues**
   - The setup script is automatically made executable
   - If you encounter permission issues, run `chmod +x .devcontainer/setup.sh`

3. **Node.js version**
   - The container uses Node.js 20 as specified in package.json
   - This matches the project's engine requirements (Node.js 20-22)

### Getting Help

- Check the main [README.md](../README.md) for project overview
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Join the [Gitter chat](https://gitter.im/bkimminich/juice-shop) for community support

## Contributing

When contributing to OWASP Juice Shop:

1. Follow the [contribution guidelines](../CONTRIBUTING.md)
2. Ensure your code passes all linting checks (`npm run lint`)
3. Write tests for new features
4. Sign off your commits with `git commit -s`

The dev container environment ensures all contributors have the same development setup, making collaboration easier and more consistent. 