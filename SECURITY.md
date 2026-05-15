# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |
| < 1.0   | ❌        |

## Reporting a vulnerability

If you discover a security vulnerability in Map3D, **please do not open a public issue.**

Instead, email the maintainers at **security@cartesiancs.com** (or open a [private security advisory](https://github.com/cartesiancs/map3d/security/advisories/new) on GitHub) with:

- A clear description of the vulnerability.
- Steps to reproduce.
- The version / commit affected.
- Any suggested fix or mitigation.

We aim to:

- Acknowledge your report within **48 hours**.
- Provide an initial assessment within **5 business days**.
- Publish a fix and credit you (unless you prefer to remain anonymous) within **30 days** for critical issues.

## Dependency security

- We monitor advisories via GitHub Dependabot.
- Dependencies are reviewed on every release.
- `npm audit fix` is run on the upgrade branch and verified in CI.

Thank you for helping keep Map3D and its users safe.
