# Contributing to CSP Kit

We love your input! We want to make contributing to CSP Kit as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Adding new service definitions
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Quick Start

1. **Fork & Clone**

   ```bash
   git clone https://github.com/yourusername/csp-kit.git
   cd csp-kit
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Build Packages**

   ```bash
   pnpm build
   ```

4. **Run Tests**

   ```bash
   pnpm test
   ```

5. **Start Development**
   ```bash
   pnpm dev
   ```

## Project Structure

```
csp-kit/
├── packages/
│   ├── generator/       # Core library - CSP generation logic
│   ├── data/            # Service definitions database
│   ├── cli/             # Command-line tools
│   ├── ui/              # Shared UI components
│   └── typescript-config/ # Shared TypeScript configurations
├── apps/
│   ├── web/             # Web interface (Next.js)
│   └── docs/            # Documentation site
└── docs/                # Maintainer documentation
```

## Contributing Guidelines

### Code Style

- **TypeScript**: 100% TypeScript with strict mode enabled
- **ESLint**: Zero warnings policy (`--max-warnings 0`)
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Use conventional commit messages

### Making Changes

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make Your Changes**
   - Write clear, documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**

   ```bash
   pnpm test           # Run all tests
   pnpm lint           # Check code style
   pnpm check-types    # TypeScript validation
   pnpm format         # Format code
   ```

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: add new service support for example-service"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Contributing Service Definitions

### Using the CLI (Recommended)

```bash
# Install CLI globally
npm install -g @csp-kit/cli

# Add new service interactively
csp-cli add --interactive

# Update existing service
csp-cli update service-id
```

### Manual Process

1. **Create Service File**

   ```bash
   # Create file: packages/data/data/services/your-service.jsonc
   ```

2. **Service Definition Structure**

   ```typescript
   {
     "id": "your-service",
     "name": "Your Service Name",
     "category": "analytics", // See ServiceCategory enum
     "description": "Brief description of what this service does",
     "website": "https://yourservice.com",
     "officialDocs": [
       "https://docs.yourservice.com/csp"
     ],
     "cspDirectives": {
       "script-src": ["https://cdn.yourservice.com"],
       "connect-src": ["https://api.yourservice.com"]
     },
     "requiresDynamic": false,
     "requiresNonce": false,
     "notes": "Initial implementation with standard CSP directives",
     "aliases": ["yourservice", "your-svc"],
     "lastUpdated": "2024-06-29T00:00:00.000Z",
     "verifiedAt": "2025-07-05T00:00:00.000Z",
     "monitoring": {
       "testUrls": ["https://yourservice.com/demo"],
       "checkInterval": "weekly",
       "alertOnBreaking": true
     }
   }
   ```

3. **Add to Services Index**
   Update `packages/data/src/services.ts` to include your service.

4. **Update Categories**
   Add your service to the appropriate category in the `categories` object.

5. **Test Your Service**
   ```bash
   pnpm test --filter @csp-kit/data
   pnpm test --filter @csp-kit/generator
   ```

## Service Definition Guidelines

### Service Management

- **Single Version**: Each service maintains one current CSP configuration
- **Verification**: Include `verifiedAt` timestamp when CSP rules are verified
- **Updates**: Update service when CSP requirements change
- **Documentation**: Explain CSP requirements in the `notes` field

### CSP Directives

- **Required Only**: Only include directives that are actually required
- **Specific Domains**: Use specific domains, avoid wildcards when possible
- **Documentation**: Include notes explaining requirements
- **Testing**: Provide test URLs for validation

### Categories

Available categories (see `ServiceCategory` enum):

- `analytics` - Analytics and tracking services
- `advertising` - Ad networks and marketing platforms
- `social` - Social media widgets and plugins
- `payment` - Payment processors and financial services
- `forms` - Form builders and survey tools
- `chat` - Customer support and chat widgets
- `cdn` - Content delivery networks
- `fonts` - Web font services
- `maps` - Mapping and location services
- `video` - Video hosting and players
- `testing` - A/B testing and experimentation
- `monitoring` - Error tracking and monitoring
- `other` - Services that don't fit other categories

## Code Review Process

1. **Automated Checks**: All PRs must pass CI checks
   - TypeScript compilation
   - ESLint (zero warnings)
   - Tests pass
   - Build succeeds

2. **Manual Review**: Maintainers will review:
   - Code quality and style
   - Service definition accuracy
   - Documentation completeness
   - Test coverage

3. **Service Validation**: For service additions/updates:
   - Verify CSP requirements against official documentation
   - Test with actual service implementation
   - Validate monitoring configuration

## Testing

### Unit Tests

```bash
pnpm test                    # All packages
pnpm test --filter @csp-kit/generator # Specific package
```

### Integration Tests

```bash
pnpm test:integration
```

### Service Validation

```bash
# Test specific service CSP requirements
csp-cli check google-analytics --url https://example.com
```

## Documentation

- **Code Comments**: Document complex logic and public APIs
- **README Updates**: Keep package READMEs current
- **Changelog**: Follow Keep a Changelog format
- **Service Docs**: Include official documentation links

## Issue Templates

Use our issue templates for:

- 🆕 **Add Service**: Request new service support
- 🔄 **Update Service**: Report CSP requirement changes
- 🐛 **Bug Report**: Report bugs or issues
- 💡 **Feature Request**: Suggest new features

## Release Process

### Versioning Strategy

- **Packages**: Follow semantic versioning
- **Services**: Maintain single current configuration per service
- **Breaking Changes**: Major version bump for API changes

### Release Checklist

1. Update CHANGELOG.md
2. Run full test suite
3. Update version numbers
4. Create release PR
5. Tag release after merge
6. Publish to npm
7. Update documentation

## Maintainer Responsibilities

### Service Monitoring

- **Weekly Reviews**: Check automated monitoring results
- **Issue Triage**: Respond to service update issues
- **Documentation**: Keep service definitions current
- **Community**: Help contributors with service additions

### Code Maintenance

- **Security**: Regular dependency updates
- **Performance**: Monitor build times and bundle sizes
- **Quality**: Maintain code quality standards
- **Architecture**: Evolve system architecture thoughtfully

## Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/eason-dev/csp-kit/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/eason-dev/csp-kit/discussions)
- 📧 **Maintainers**: [maintainers@csp-kit.eason.ch](mailto:maintainers@csp-kit.eason.ch)
- 📖 **Documentation**: [csp-kit.eason.ch/docs](https://csp-kit.eason.ch/docs)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
