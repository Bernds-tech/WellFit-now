# WellFit development operating status

Current operating mode: GitHub-only development.

- The canonical product repository is `Bernds-tech/WellFit-now`.
- There is currently no active WellFit server or SSH deployment target used by this project.
- Changes must be made on scoped branches and reviewed through pull requests.
- GitHub Actions may build and run emulator checks, but must not deploy unrelated products or external services.
- Firebase deployment, hosting setup, server provisioning, production writes, and secrets configuration require a separate explicit owner decision.

This status note exists to prevent unrelated deployment workflows or server assumptions from being added to WellFit.
