Here are the essential commands for developing and managing the DiscordBot-Maker project:

**Development Server:**
- `npm run dev`: Starts the Next.js development server. The application will be accessible at `http://localhost:3000`.

**Build and Start (Production):**
- `npm run build`: Builds the Next.js application for production deployment.
- `npm run start`: Starts the Next.js production server after the application has been built.

**Code Quality and Type Checking:**
- `npm run lint`: Runs ESLint to identify and report on patterns found in JavaScript/TypeScript code, helping to maintain code quality and consistency.
- `npm run type-check`: Executes the TypeScript compiler (`tsc --noEmit`) to perform type checking across the project without emitting any JavaScript files. This is crucial for catching type-related errors early.

**Dependency Management:**
- `npm install`: Installs all project dependencies defined in `package.json`. This should be run after cloning the repository or when `package.json` changes.

**Git Commands (Standard):**
- `git clone <repository_url>`: Clones the project repository.
- `git status`: Shows the working tree status.
- `git add <file>`: Stages changes for the next commit.
- `git commit -m "Commit message"`: Records changes to the repository.
- `git push`: Uploads local repository content to a remote repository.
- `git pull`: Fetches from and integrates with another repository or a local branch.

**File System Commands (Darwin/Unix-like):**
- `ls`: List directory contents.
- `cd <directory>`: Change the current directory.
- `pwd`: Print name of current working directory.
- `cp <source> <destination>`: Copy files or directories. (e.g., `cp .env.example .env.local`)
- `rm <file>`: Remove files.
- `mkdir <directory>`: Make directories.
- `grep <pattern> <file>`: Search for patterns in files.
- `find <path> -name <pattern>`: Search for files in a directory hierarchy.

**Environment Variable Setup:**
- `cp .env.example .env.local`: Copies the example environment file to create a local configuration file. Remember to fill in the necessary values in `.env.local`.