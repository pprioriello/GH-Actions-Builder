export const CATALOG = [
  { cat: 'General', steps: [
    { type: 'checkout', label: 'Checkout code', icon: 'ch', theme: 'blue', tip: 'Checks out your repository. Uses actions/checkout@v4.', def: { name: 'Checkout code', uses: 'actions/checkout@v4', with: { ref: '', fetchDepth: '1' } } },
    { type: 'setup-node', label: 'Setup Node.js', icon: 'nd', theme: 'green', tip: 'Sets up Node.js using actions/setup-node.', def: { name: 'Setup Node.js', uses: 'actions/setup-node@v4', with: { nodeVersion: '20', cache: 'npm' } } },
    { type: 'run', label: 'Run command', icon: 'sh', theme: 'gray', tip: 'Runs any shell command or multi-line script.', def: { name: 'Run command', run: 'echo hello' } },
    { type: 'env', label: 'Set env variable', icon: 'ev', theme: 'amber', tip: 'Appends a variable to GITHUB_ENV for subsequent steps.', def: { name: 'Set env variable', run: 'echo MY_VAR=value >> $GITHUB_ENV' } },
    { type: 'cache', label: 'Cache files', icon: 'ca', theme: 'purple', tip: 'Caches arbitrary paths to speed up runs.', def: { name: 'Cache files', uses: 'actions/cache@v4', with: { path: 'node_modules', key: 'node-modules' } } },
    { type: 'upload-artifact', label: 'Upload artifact', icon: 'up', theme: 'purple', tip: 'Saves build output as a workflow artifact.', def: { name: 'Upload artifact', uses: 'actions/upload-artifact@v4', with: { name: 'build', path: 'dist/' } } },
    { type: 'download-artifact', label: 'Download artifact', icon: 'dn', theme: 'purple', tip: 'Downloads an artifact produced by an earlier job.', def: { name: 'Download artifact', uses: 'actions/download-artifact@v4', with: { name: 'build' } } },
    { type: 'create-release', label: 'Create release', icon: 'rl', theme: 'teal', tip: 'Creates a GitHub release from a tag.', def: { name: 'Create release', uses: 'softprops/action-gh-release@v2', with: { tag_name: 'ref_name', generateReleaseNotes: 'true' } } },
  ]},
  { cat: 'Node.js / JS', steps: [
    { type: 'npm-ci', label: 'npm ci', icon: 'ci', theme: 'green', tip: 'Clean reproducible install from package-lock.json.', def: { name: 'Install dependencies', run: 'npm ci' } },
    { type: 'npm-install', label: 'npm install', icon: 'ni', theme: 'green', tip: 'Installs dependencies.', def: { name: 'npm install', run: 'npm install' } },
    { type: 'npm-build', label: 'npm run build', icon: 'bu', theme: 'green', tip: 'Builds the project.', def: { name: 'Build', run: 'npm run build' } },
    { type: 'npm-test', label: 'npm test', icon: 'te', theme: 'green', tip: 'Runs the test suite.', def: { name: 'Run tests', run: 'npm test' } },
    { type: 'npm-lint', label: 'npm run lint', icon: 'li', theme: 'green', tip: 'Runs the linter.', def: { name: 'Lint', run: 'npm run lint' } },
    { type: 'setup-pnpm', label: 'Setup pnpm', icon: 'pn', theme: 'amber', tip: 'Installs pnpm using pnpm/action-setup.', def: { name: 'Setup pnpm', uses: 'pnpm/action-setup@v4', with: { version: '9' } } },
    { type: 'setup-bun', label: 'Setup Bun', icon: 'bn', theme: 'amber', tip: 'Installs Bun runtime.', def: { name: 'Setup Bun', uses: 'oven-sh/setup-bun@v2', with: { bunVersion: 'latest' } } },
  ]},
  { cat: 'Python', steps: [
    { type: 'setup-python', label: 'Setup Python', icon: 'py', theme: 'blue', tip: 'Sets up a Python version.', def: { name: 'Setup Python', uses: 'actions/setup-python@v5', with: { pythonVersion: '3.12', cache: 'pip' } } },
    { type: 'pip-install', label: 'pip install', icon: 'pi', theme: 'blue', tip: 'Installs Python dependencies.', def: { name: 'Install dependencies', run: 'pip install -r requirements.txt' } },
    { type: 'pytest', label: 'Run pytest', icon: 'pt', theme: 'blue', tip: 'Runs the test suite with pytest.', def: { name: 'Run tests', run: 'pytest' } },
    { type: 'setup-uv', label: 'Setup uv', icon: 'uv', theme: 'blue', tip: 'Installs the uv Python package manager.', def: { name: 'Setup uv', uses: 'astral-sh/setup-uv@v4', with: { version: 'latest' } } },
  ]},
  { cat: 'Java / JVM', steps: [
    { type: 'setup-java', label: 'Setup Java', icon: 'jv', theme: 'coral', tip: 'Sets up a JDK.', def: { name: 'Setup Java', uses: 'actions/setup-java@v4', with: { javaVersion: '21', distribution: 'temurin' } } },
    { type: 'maven-build', label: 'Maven build', icon: 'mv', theme: 'coral', tip: 'Builds a Maven project.', def: { name: 'Maven build', run: 'mvn -B install --no-transfer-progress' } },
    { type: 'gradle-build', label: 'Gradle build', icon: 'gr', theme: 'coral', tip: 'Builds a Gradle project.', def: { name: 'Gradle build', run: './gradlew build' } },
    { type: 'setup-gradle', label: 'Setup Gradle', icon: 'gd', theme: 'coral', tip: 'Sets up Gradle.', def: { name: 'Setup Gradle', uses: 'gradle/actions/setup-gradle@v4' } },
  ]},
  { cat: 'Go', steps: [
    { type: 'setup-go', label: 'Setup Go', icon: 'go', theme: 'teal', tip: 'Sets up a Go version.', def: { name: 'Setup Go', uses: 'actions/setup-go@v5', with: { goVersion: '1.22' } } },
    { type: 'go-build', label: 'Go build', icon: 'gb', theme: 'teal', tip: 'Builds a Go project.', def: { name: 'Build', run: 'go build ./...' } },
    { type: 'go-test', label: 'Go test', icon: 'gt', theme: 'teal', tip: 'Runs Go tests.', def: { name: 'Test', run: 'go test ./...' } },
  ]},
  { cat: 'Rust', steps: [
    { type: 'setup-rust', label: 'Setup Rust', icon: 'rs', theme: 'coral', tip: 'Sets up a Rust toolchain.', def: { name: 'Setup Rust', uses: 'dtolnay/rust-toolchain@stable' } },
    { type: 'cargo-build', label: 'Cargo build', icon: 'cb', theme: 'coral', tip: 'Builds a Rust project.', def: { name: 'Cargo build', run: 'cargo build --release' } },
    { type: 'cargo-test', label: 'Cargo test', icon: 'ct', theme: 'coral', tip: 'Runs Rust tests.', def: { name: 'Cargo test', run: 'cargo test' } },
  ]},
  { cat: '.NET / C#', steps: [
    { type: 'setup-dotnet', label: 'Setup .NET', icon: 'dn', theme: 'purple', tip: 'Sets up a .NET SDK.', def: { name: 'Setup .NET', uses: 'actions/setup-dotnet@v4', with: { dotnetVersion: '8.x' } } },
    { type: 'dotnet-build', label: 'dotnet build', icon: 'db', theme: 'purple', tip: 'Builds a .NET solution.', def: { name: 'Build', run: 'dotnet build --configuration Release' } },
    { type: 'dotnet-test', label: 'dotnet test', icon: 'dt', theme: 'purple', tip: 'Runs .NET tests.', def: { name: 'Test', run: 'dotnet test --no-build --configuration Release' } },
    { type: 'dotnet-publish', label: 'dotnet publish', icon: 'dp', theme: 'purple', tip: 'Publishes a .NET app.', def: { name: 'Publish', run: 'dotnet publish -c Release -o ./publish' } },
  ]},
  { cat: 'Docker', steps: [
    { type: 'docker-login', label: 'Docker login', icon: 'dl', theme: 'blue', tip: 'Logs into Docker Hub or a container registry.', def: { name: 'Login to Docker Hub', uses: 'docker/login-action@v3', with: { username: 'secrets.DOCKERHUB_USERNAME', password: 'secrets.DOCKERHUB_TOKEN' } } },
    { type: 'docker-meta', label: 'Docker metadata', icon: 'dm', theme: 'blue', tip: 'Generates tags and labels for Docker images.', def: { name: 'Docker metadata', uses: 'docker/metadata-action@v5', with: { images: 'myorg/myapp' } } },
    { type: 'docker-build', label: 'Build and push image', icon: 'di', theme: 'blue', tip: 'Builds and pushes a Docker image.', def: { name: 'Build and push', uses: 'docker/build-push-action@v6', with: { context: '.', push: 'true', tags: 'meta.outputs.tags' } } },
    { type: 'docker-setup-buildx', label: 'Setup Buildx', icon: 'bx', theme: 'blue', tip: 'Sets up Docker Buildx for multi-platform builds.', def: { name: 'Set up Buildx', uses: 'docker/setup-buildx-action@v3' } },
    { type: 'ghcr-login', label: 'Login to GHCR', icon: 'gc', theme: 'blue', tip: 'Logs into GitHub Container Registry.', def: { name: 'Login to GHCR', uses: 'docker/login-action@v3', with: { registry: 'ghcr.io', username: 'github.actor', password: 'secrets.GITHUB_TOKEN' } } },
  ]},
  { cat: 'AWS', steps: [
    { type: 'aws-credentials', label: 'AWS credentials', icon: 'aw', theme: 'amber', tip: 'Configures AWS credentials via OIDC or access key.', def: { name: 'Configure AWS credentials', uses: 'aws-actions/configure-aws-credentials@v4', with: { roleToAssume: 'secrets.AWS_ROLE', awsRegion: 'us-east-1' } } },
    { type: 'ecr-login', label: 'Login to ECR', icon: 'er', theme: 'amber', tip: 'Logs in to Amazon ECR.', def: { name: 'Login to ECR', uses: 'aws-actions/amazon-ecr-login@v2' } },
    { type: 'deploy-s3', label: 'Sync to S3', icon: 's3', theme: 'amber', tip: 'Syncs files to an S3 bucket.', def: { name: 'Deploy to S3', run: 'aws s3 sync ./dist s3://my-bucket --delete' } },
    { type: 'sam-deploy', label: 'SAM deploy', icon: 'sm', theme: 'amber', tip: 'Deploys a serverless AWS SAM application.', def: { name: 'SAM deploy', uses: 'aws-actions/aws-sam-build-deploy@v1', with: { stackName: 'my-app', awsRegion: 'us-east-1' } } },
  ]},
  { cat: 'GCP', steps: [
    { type: 'gcp-auth', label: 'GCP auth', icon: 'ga', theme: 'red', tip: 'Authenticates to Google Cloud.', def: { name: 'Auth to GCP', uses: 'google-github-actions/auth@v2', with: { workloadIdentityProvider: 'secrets.GCP_WIF_PROVIDER', serviceAccount: 'secrets.GCP_SA' } } },
    { type: 'gcp-gke', label: 'Get GKE credentials', icon: 'gk', theme: 'red', tip: 'Fetches credentials for a GKE cluster.', def: { name: 'Get GKE credentials', uses: 'google-github-actions/get-gke-credentials@v2', with: { clusterName: 'my-cluster', location: 'us-central1' } } },
    { type: 'deploy-cloudrun', label: 'Deploy Cloud Run', icon: 'cr', theme: 'red', tip: 'Deploys a container to Google Cloud Run.', def: { name: 'Deploy to Cloud Run', uses: 'google-github-actions/deploy-cloudrun@v2', with: { service: 'my-service', image: 'gcr.io/my-project/my-app' } } },
  ]},
  { cat: 'Azure', steps: [
    { type: 'azure-login', label: 'Azure login', icon: 'az', theme: 'blue', tip: 'Logs into Azure.', def: { name: 'Azure login', uses: 'azure/login@v2', with: { creds: 'secrets.AZURE_CREDENTIALS' } } },
    { type: 'azure-webapp', label: 'Deploy Azure Web App', icon: 'wa', theme: 'blue', tip: 'Deploys an app to Azure Web Apps.', def: { name: 'Deploy to Azure Web App', uses: 'azure/webapps-deploy@v3', with: { appName: 'my-app', publishProfile: 'secrets.AZURE_WEBAPP_PUBLISH_PROFILE' } } },
    { type: 'azure-aks', label: 'Set AKS context', icon: 'ak', theme: 'blue', tip: 'Sets kubectl context for AKS.', def: { name: 'Set AKS context', uses: 'azure/aks-set-context@v4', with: { resourceGroupName: 'my-rg', clusterName: 'my-aks' } } },
  ]},
  { cat: 'CD / Deploy', steps: [
    { type: 'deploy-pages', label: 'Deploy GitHub Pages', icon: 'gp', theme: 'teal', tip: 'Deploys static files to GitHub Pages.', def: { name: 'Deploy to GitHub Pages', uses: 'peaceiris/actions-gh-pages@v4', with: { githubToken: 'secrets.GITHUB_TOKEN', publishDir: './dist' } } },
    { type: 'deploy-vercel', label: 'Deploy to Vercel', icon: 'vr', theme: 'teal', tip: 'Deploys a project to Vercel via CLI.', def: { name: 'Deploy to Vercel', run: 'npx vercel --prod --token=secrets.VERCEL_TOKEN' } },
    { type: 'deploy-netlify', label: 'Deploy to Netlify', icon: 'nl', theme: 'teal', tip: 'Deploys to Netlify.', def: { name: 'Deploy to Netlify', uses: 'nwtgck/actions-netlify@v3', with: { publishDir: './dist', productionDeploy: 'true', netlifyAuthToken: 'secrets.NETLIFY_AUTH_TOKEN', siteId: 'secrets.NETLIFY_SITE_ID' } } },
    { type: 'deploy-fly', label: 'Deploy to Fly.io', icon: 'fl', theme: 'teal', tip: 'Deploys an app to Fly.io.', def: { name: 'Deploy to Fly.io', uses: 'superfly/flyctl-actions/deploy@master', env: { FLY_API_TOKEN: 'secrets.FLY_API_TOKEN' } } },
    { type: 'deploy-heroku', label: 'Deploy to Heroku', icon: 'hk', theme: 'teal', tip: 'Deploys to Heroku.', def: { name: 'Deploy to Heroku', uses: 'akhileshns/heroku-deploy@v3.13.15', with: { herokuApiKey: 'secrets.HEROKU_API_KEY', herokuAppName: 'my-app', herokuEmail: 'secrets.HEROKU_EMAIL' } } },
    { type: 'k8s-apply', label: 'kubectl apply', icon: 'k8', theme: 'purple', tip: 'Applies Kubernetes manifests.', def: { name: 'Deploy to Kubernetes', run: 'kubectl apply -f k8s/' } },
    { type: 'helm-deploy', label: 'Helm deploy', icon: 'hm', theme: 'purple', tip: 'Deploys a Helm chart.', def: { name: 'Helm deploy', run: 'helm upgrade --install my-app ./chart --namespace production' } },
  ]},
  { cat: 'Security', steps: [
    { type: 'codeql-init', label: 'CodeQL initialize', icon: 'cq', theme: 'red', tip: 'Initializes CodeQL for security analysis.', def: { name: 'Initialize CodeQL', uses: 'github/codeql-action/init@v3', with: { languages: 'javascript' } } },
    { type: 'codeql-analyze', label: 'CodeQL analyze', icon: 'ca', theme: 'red', tip: 'Runs CodeQL security analysis.', def: { name: 'CodeQL analyze', uses: 'github/codeql-action/analyze@v3' } },
    { type: 'trivy-scan', label: 'Trivy scan', icon: 'tv', theme: 'red', tip: 'Scans for vulnerabilities with Trivy.', def: { name: 'Trivy scan', uses: 'aquasecurity/trivy-action@master', with: { imageRef: 'myorg/myapp:latest', format: 'table' } } },
    { type: 'snyk-test', label: 'Snyk test', icon: 'sn', theme: 'red', tip: 'Tests for vulnerabilities with Snyk.', def: { name: 'Snyk scan', uses: 'snyk/actions/node@master', env: { SNYK_TOKEN: 'secrets.SNYK_TOKEN' } } },
    { type: 'sonarcloud', label: 'SonarCloud scan', icon: 'sc', theme: 'red', tip: 'Analyzes code quality with SonarCloud.', def: { name: 'SonarCloud scan', uses: 'SonarSource/sonarcloud-github-action@master', env: { GITHUB_TOKEN: 'secrets.GITHUB_TOKEN', SONAR_TOKEN: 'secrets.SONAR_TOKEN' } } },
    { type: 'semgrep', label: 'Semgrep scan', icon: 'sg', theme: 'red', tip: 'Runs Semgrep static analysis.', def: { name: 'Semgrep scan', uses: 'returntocorp/semgrep-action@v1', with: { config: 'p/default' } } },
  ]},
  { cat: 'Testing', steps: [
    { type: 'codecov', label: 'Upload to Codecov', icon: 'cc', theme: 'pink', tip: 'Uploads code coverage to Codecov.', def: { name: 'Upload coverage', uses: 'codecov/codecov-action@v4', with: { token: 'secrets.CODECOV_TOKEN' } } },
    { type: 'playwright', label: 'Playwright tests', icon: 'pw', theme: 'purple', tip: 'Runs Playwright end-to-end tests.', def: { name: 'Playwright tests', uses: 'microsoft/playwright-github-action@v1' } },
    { type: 'cypress', label: 'Cypress e2e tests', icon: 'cy', theme: 'green', tip: 'Runs Cypress end-to-end tests.', def: { name: 'Cypress tests', uses: 'cypress-io/github-action@v6', with: { build: 'npm run build', start: 'npm start' } } },
  ]},
  { cat: 'Notifications', steps: [
    { type: 'slack-notify', label: 'Slack notification', icon: 'sl', theme: 'pink', tip: 'Sends a Slack message.', def: { name: 'Notify Slack', uses: 'slackapi/slack-github-action@v1.27', with: { payload: 'text:Build done' }, env: { SLACK_WEBHOOK_URL: 'secrets.SLACK_WEBHOOK_URL' } } },
    { type: 'teams-notify', label: 'MS Teams notification', icon: 'mt', theme: 'purple', tip: 'Sends a Microsoft Teams message.', def: { name: 'Notify Teams', uses: 'toko-bifrost/ms-teams-deploy-card@master', with: { githubToken: 'secrets.GITHUB_TOKEN', webhookUri: 'secrets.TEAMS_WEBHOOK' } } },
    { type: 'discord-notify', label: 'Discord notification', icon: 'dc', theme: 'purple', tip: 'Sends a Discord notification.', def: { name: 'Notify Discord', uses: 'Ilshidur/action-discord@master', env: { DISCORD_WEBHOOK: 'secrets.DISCORD_WEBHOOK' } } },
  ]},
  { cat: 'Git and GitHub', steps: [
    { type: 'create-pr', label: 'Create pull request', icon: 'pr', theme: 'blue', tip: 'Creates a pull request.', def: { name: 'Create PR', uses: 'peter-evans/create-pull-request@v7', with: { token: 'secrets.GITHUB_TOKEN', commitMessage: 'auto: update', title: 'Automated update' } } },
    { type: 'auto-commit', label: 'Auto commit changes', icon: 'ac', theme: 'blue', tip: 'Commits and pushes generated files back.', def: { name: 'Commit changes', uses: 'stefanzweifel/git-auto-commit-action@v5', with: { commitMessage: 'chore: auto-update' } } },
    { type: 'label-pr', label: 'Label PR', icon: 'lp', theme: 'blue', tip: 'Adds labels to pull requests.', def: { name: 'Label PR', uses: 'actions/labeler@v5', with: { repoToken: 'secrets.GITHUB_TOKEN' } } },
    { type: 'gh-script', label: 'GitHub Script', icon: 'gs', theme: 'blue', tip: 'Runs inline JS using the GitHub API.', def: { name: 'GitHub Script', uses: 'actions/github-script@v7', with: { script: "github.rest.issues.createComment({issue_number:1,owner:context.repo.owner,repo:context.repo.repo,body:'Hello!'})" } } },
  ]},
]

export const STEP_THEME_MAP = {}
export const STEP_DEFAULTS_MAP = {}

CATALOG.forEach(cat => {
  cat.steps.forEach(s => {
    STEP_THEME_MAP[s.type] = s.theme
    STEP_DEFAULTS_MAP[s.type] = s.def
  })
})
