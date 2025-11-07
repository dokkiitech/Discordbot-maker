When a task is completed, the following steps should be taken to ensure code quality, consistency, and proper functionality:

1.  **Code Review:** Ensure your code adheres to the established code style and conventions (TypeScript best practices, ESLint rules).
2.  **Linting:** Run `npm run lint` to catch any linting errors or warnings. All issues should be resolved before committing.
3.  **Type Checking:** Run `npm run type-check` to ensure there are no TypeScript compilation errors.
4.  **Local Testing:** Thoroughly test the implemented feature or bug fix locally using `npm run dev`. Verify that the changes work as expected and do not introduce regressions.
5.  **Environment Variables:** If new environment variables are introduced, update `.env.example` and provide clear instructions for their configuration.
6.  **Documentation:** Update any relevant documentation (e.g., `README.md`, `docs/`) to reflect changes in functionality, setup, or usage.
7.  **Commit Changes:** Commit your changes with a clear and concise commit message that explains the purpose of the changes. Follow conventional commit guidelines if established.
8.  **Pull Request:** Create a pull request to the main branch, describing the changes and linking to any relevant issues. Ensure all automated checks (CI/CD) pass.