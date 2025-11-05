# Contributing to the Weave VS Code Extension

Thank you for your interest in contributing to the Weave AI Assistant extension. We appreciate all contributions, from documentation updates to new features.

## Code of Conduct

Please make sure you have read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). If you observe unacceptable behavior, report it via GitHub issues or by emailing support@kitiumai.com.

## Prerequisites

- Node.js 18.x or 20.x (LTS recommended)
- npm 9+ (comes with Node.js)
- Visual Studio Code 1.90 or later
- Git

You may optionally install the **ESLint** and **Prettier** VS Code extensions to get inline feedback while editing TypeScript files.

## First-Time Setup

```bash
# Clone the repository
git clone https://github.com/kitium-ai/weave-vscode.git
cd weave-vscode

# Install dependencies
npm install
```

Whenever dependencies change, re-run `npm install` to stay in sync.

## Local Development Workflow

1. Create a topic branch from `main`:
   ```bash
   git checkout -b feature/<short-description>
   # or
   git checkout -b fix/<short-description>
   ```
2. Make your changes incrementally and keep commits focused.
3. Run the quality checks listed below before pushing.
4. Push your branch and open a pull request when you are ready for review.

### Building and Debugging the Extension

- **One-off compile:** `npm run compile`
- **Watch mode for active development:** `npm run watch`
- **Launch inside VS Code:** Press `F5` (Run > Start Debugging) to open a new Extension Development Host once the TypeScript build succeeds.

Additional development tips are available in [`DEVELOPMENT.md`](./DEVELOPMENT.md).

### Running Tests

Our test suite uses the official VS Code test runner.

```bash
npm test
```

The `pretest` script automatically runs `npm run compile` and `npm run lint` before executing the tests.

## Quality Gates

Run these commands locally before committing or opening a pull request:

```bash
npm run lint        # eslint over TypeScript sources
npm run type-check  # strict TypeScript compilation without emitting
npm test            # integration/unit tests via vscode-test
```

These checks must pass in CI. If you add new CLI scripts that affect linting or tests, update this list accordingly.

## Coding Guidelines

- TypeScript strict mode is enabled—prefer precise types and avoid `any`.
- Keep functions small and focused; share utilities across `src/` when possible.
- Follow the existing folder structure (commands, services, telemetry, etc.).
- Write or update tests for new behavior and edge cases.
- Update documentation (`README.md`, `DEVELOPMENT.md`, snippets) when user-facing behavior changes.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) so that changelogs can be generated automatically.

```
type(optional-scope): short summary
```

Examples:

```
feat(commands): add prompt generation command
fix(telemetry): handle missing configuration gracefully
docs(readme): clarify API key setup
```

## Pull Request Checklist

Before requesting review, confirm that:

- `npm run lint`, `npm run type-check`, and `npm test` all pass.
- New or changed behavior includes automated tests when practical.
- Documentation and samples are updated if the UX or API changes.
- The PR description clearly explains the motivation and the solution.
- Screenshots or recordings are attached for UI-visible changes.

PRs require at least one maintainer review and a passing CI run before merging.

## Reporting Issues

When filing an issue, please include:

- A clear problem statement or feature request.
- Steps to reproduce (for bugs) along with expected vs. actual behavior.
- Environment details (OS, VS Code version, Node.js version, extension version).
- Relevant logs or stack traces, if available.

## Need Help?

- Review the [README](./README.md) for an overview of the extension.
- Consult the [Quickstart](./QUICKSTART.md) for usage examples.
- Check existing [GitHub Issues](https://github.com/kitium-ai/weave-vscode/issues) before opening a new one.
- Reach out via support@kitiumai.com if you have a question that cannot be addressed publicly.

We are grateful for your contributions—thank you for helping improve the Weave AI Assistant!
