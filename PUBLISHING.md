# Publishing Instructions

## Publishing npm Package

```bash
npm run build
npm publish --access public
```

## Versioning

Use [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for new functionality with backward compatibility
- PATCH version for bug fixes

## Pre-Publishing Checklist

1. Ensure all tests pass
2. Verify examples work correctly
3. Update version in package.json
4. Update CHANGELOG.md
5. Create git tag: `git tag v1.0.0`
6. Verify cryptographic operations are secure

