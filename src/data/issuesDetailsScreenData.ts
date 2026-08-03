import { ThemeContextType } from '../theme/ThemeProvider';
export type StatusType = string;

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  color: string;
  time: string;
  text: string;
}

export interface DetailItem {
  label: string;
  value: string;
  initials?: string;
  color?: string;
  dot?: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface StatusColor {
  bg: string;
  text: string;
}

export type StatusColorMap = Record<StatusType, StatusColor>;

export interface Issue {
  id: string;
  title: string;
  status: StatusType;
  priority?: 'Low' | 'Medium' | 'High';
  type?: string;
  project?: string;
  assignee?: string;
  points?: string | number;
  avatar?: string;
  avatarColor?: string;
  newComment?: string;
  description?: string;
}

export const getComments = (colors: ThemeContextType['colors']): Comment[] => [
  {
    id: 1,
    author: 'Maya Kim',
    avatar: 'MK',
    color: colors.primary,
    time: '2 hours ago',
    text: "I've reproduced this on iOS 17.2 as well. The token seems to expire before the refresh callback fires.",
  },
  {
    id: 2,
    author: 'Sam Rivera',
    avatar: 'SR',
    color: colors.error || colors.primary,
    time: '1 hour ago',
    text: 'Looking at the auth service logs, the token TTL is set to 15 minutes but the client expects 30. Could be a misconfiguration.',
  },
  {
    id: 3,
    author: 'Alex Johnson',
    avatar: 'AJ',
    color: colors.warning || colors.primary,
    time: '45 min ago',
    text: "Good catch! I'll check the env vars and update the TTL. Should have a fix ready by EOD.",
  },
];

export const getDetails = (
  colors: ThemeContextType['colors'],
): DetailItem[] => [
  {
    label: 'Assignee',
    initials: 'AJ',
    color: colors.warning || colors.primary,
    value: 'Alex Johnson',
  },
  {
    label: 'Reporter',
    initials: 'MK',
    color: colors.primary,
    value: 'Maya Kim',
  },
  {
    label: 'Priority',
    value: 'High',
    dot: colors.error || colors.primary,
  },
  {
    label: 'Sprint',
    value: 'Sprint 14',
  },
  {
    label: 'Story points',
    value: '5',
  },
  {
    label: 'Due date',
    value: 'Jul 22, 2025',
  },
];

export const subtasks: Subtask[] = [
  {
    id: 'CLOUD-330a',
    title: 'Reproduce and document the failure scenario',
    done: true,
  },
  {
    id: 'CLOUD-330b',
    title: 'Fix token TTL mismatch in auth service config',
    done: false,
  },
  {
    id: 'CLOUD-330c',
    title: 'Add integration test for token refresh flow',
    done: false,
  },
];

export const statusOptions: StatusType[] = [
  'To Do',
  'In Progress',
  'In Review',
  'Done',
];

export const getStatusColors = (
  colors: ThemeContextType['colors'],
): StatusColorMap => ({
  'To Do': {
    bg: colors.surface || colors.background,
    text: colors.textSecondary,
  },
  'In Progress': {
    bg: colors.card || colors.surface,
    text: colors.primary,
  },
  'In Review': {
    bg: colors.card || colors.surface,
    text: colors.secondary || colors.primary,
  },
  Done: {
    bg: colors.card || colors.surface,
    text: colors.success || colors.primary,
  },
});

export const getMyIssues = (colors: ThemeContextType['colors']): Issue[] => [
  {
    id: 'API-72',
    title: 'Update OpenAPI spec for v3 endpoints',
    type: 'Task',
    status: 'In Review',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.info,
    description:
      'This task focuses on comprehensively updating our OpenAPI specification file to mirror all recent changes introduced in the v3 API endpoints. As part of this update, all endpoint paths, HTTP request methods, request body schemas, and response formats must be validated against the current production implementation. Furthermore, error response models and authentication requirements need clear documentation to assist external developers during integration. Accurate OpenAPI schemas ensure that our automated SDK generation tools and public developer portal stay fully synchronized without manual intervention, preventing breaking changes or integration mismatches for third-party consumers.',
  },
  {
    id: 'MOB-128',
    title: 'Push notification service ready for testing on iOS and Android',
    type: 'Story',
    status: 'To Do',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'We have finalized the core architecture for the unified mobile push notification service across both iOS (APNs) and Android (FCM) platforms. The service handles user token registration, silent background payloads, deep linking routes, and scheduled notification queues seamlessly. Before launching to production, the QA team needs to execute end-to-end test suites verifying background notification delivery, notification action button handling, app state transitions, and device token refresh edge cases. Additionally, payload delivery speeds, fallback retry mechanisms during network drops, and device-level notification permissions must be rigorously validated across multiple OS versions and screen densities.',
  },
  {
    id: 'CLOUD-330',
    title: 'OAuth token refresh failing on iOS clients',
    type: 'Story',
    status: 'In Progress',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'Several mobile app users on iOS devices are experiencing unexpected authentication logouts when their short-lived JWT access token expires. Investigation reveals that silent background token refresh requests sent to the OAuth server either time out or fail to properly update the local secure key-value storage (Keychain) on iOS. This issue causes subsequent API requests to return 401 Unauthorized errors, disrupting active user sessions. The developer must inspect the HTTP interceptor logic, concurrency control during token refresh operations, and native iOS Keychain persistence rules to ensure refresh tokens are exchanged seamlessly without forcing users to re-login.',
  },
  {
    id: 'CLOUD-331',
    title: 'Migrate auth service to Kubernetes v1.28',
    type: 'Task',
    status: 'In Progress',
    priority: 'Medium',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'As part of our infrastructure modernization strategy, the core authentication service must be upgraded to run on Kubernetes cluster version 1.28. This migration requires auditing current Deployment, StatefulSet, and Ingress YAML manifests for deprecated API versions and compatibility warnings. In addition, container resource limits, readiness probes, and liveness probes must be re-evaluated to ensure optimal pod scheduling. DevOps engineers need to execute rolling deployment testing in the staging environment to verify zero-downtime Pod restarts, evaluate network security policy enforcement, and ensure seamless integration with the updated Kubernetes control plane prior to production release.',
  },
  {
    id: 'DS-14',
    title: 'Design token audit and cleanup',
    type: 'Story',
    status: 'To Do',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'Over past release cycles, duplicated, hardcoded, and inconsistent color hex codes, spacing measurements, and typography styles have accumulated across the mobile UI components. This story aims to perform a thorough audit of our design system token repository. We will remove obsolete variables, standardize naming conventions for light and dark themes, and align React Native theme structures directly with Figma design variables. Updating these design tokens will improve UI consistency, streamline developer handoffs, reduce stylesheet bloat, and ensure that future brand changes can be propagated globally across all app screens with minimal effort.',
  },
  {
    id: 'API-67',
    title: 'Rate limiting documentation updates',
    type: 'Task',
    status: 'In Review',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.info,
    description:
      'With our newly deployed API gateway rate-limiting algorithms, public and internal developer documentation needs comprehensive updates. The documentation must clearly detail specific HTTP header fields returned with every request, such as X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset. Additionally, clear code examples demonstrating how clients should implement exponential backoff and jitter strategies when encountering HTTP 429 Too Many Requests status codes must be added. Providing well-structured rate limiting guidelines ensures API consumers design resilient integration routines, reducing server overload and lowering customer support requests regarding throttled connection calls.',
  },
  {
    id: 'MOB-129',
    title: 'Dark mode flicker on navigation',
    type: 'Story',
    status: 'In Review',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'When users navigate between distinct screens while dark mode is enabled, a noticeable white screen flash occurs during screen transition animations. This visually jarring flicker is caused by background container elements defaulting to theme light values before the async theme context state finishes applying the dark theme variables. To resolve this, screen wrapper components and native navigator backgrounds must be configured to synchronize immediately with system context colors. Eliminating screen transition flickering will significantly elevate the visual refinement and premium user experience expected from our mobile application across all device displays.',
  },
  {
    id: 'CLOUD-340',
    title: 'Implement zero-downtime deployment pipeline',
    type: 'Story',
    status: 'In Progress',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'To maintain strict SLA commitments and eliminate service interruptions during application releases, we are building an automated zero-downtime deployment pipeline in CI/CD. Using blue-green deployment strategies combined with progressive canary rollouts, the new pipeline will shift live user traffic incrementally to updated microservice instances while monitoring error rates in real time. If unexpected HTTP 5xx spikes or database connection drops are detected, the pipeline automatically aborts the rollout and instantly routes traffic back to stable nodes. This infrastructure improvement eliminates scheduled maintenance windows and increases deployment frequency safely.',
  },
  {
    id: 'CLOUD-341',
    title: 'OAuth token refresh failing on iOS',
    type: 'Bug',
    status: 'In Progress',
    priority: 'High',
    avatar: 'B',
    avatarColor: colors.error,
    description:
      'A critical authentication bug on iOS devices causes active user sessions to break unexpectedly during background token refresh routines. The mobile app attempts to execute concurrent refresh calls when multiple API requests trigger simultaneously after network reconnection, leading to race conditions where old refresh tokens are invalidated prematurely by the auth server. The developer must implement a centralized token-refresh queue that serializes incoming requests, reuses pending refresh promises, and correctly updates securely encrypted native storage. Resolving this defect restores stable session handling and stops unintended user force-logouts.',
  },
  {
    id: 'CLOUD-320',
    title: 'Add circuit breaker pattern to API calls',
    type: 'Story',
    status: 'In Review',
    priority: 'Low',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'To prevent cascading system failures when downstream microservices experience degradation or high latency, we are integrating the circuit breaker pattern into our core API HTTP client layer. When error thresholds or request timeouts exceed defined limits, the circuit breaker opens, immediately returning graceful fallback responses without overwhelming struggling dependency servers with repeated requests. Once the downstream service recovers, the circuit breaker transitions through a half-open state to resume normal traffic flow safely. This architectural pattern boosts overall platform resilience, fault tolerance, and reliability during peak load surges.',
  },
  {
    id: 'CLOUD-302',
    title: 'Migrate to k8s v1.28',
    type: 'Task',
    status: 'To Do',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'This task encompasses upgrading our core Kubernetes production cluster infrastructure to version 1.28. The scope includes auditing cluster configuration files, updating node pool images, verifying container runtime interface (CRI) compatibility, and testing service mesh communication across upgraded worker nodes. Engineers must schedule a rolling worker node replacement strategy to ensure that active workload pods migrate smoothly without dropping live user connections. Upgrading to Kubernetes v1.28 brings critical security patches, improved memory scheduling capabilities, enhanced storage driver performance, and long-term support compliance for our backend services.',
  },
  {
    id: 'CLOUD-342',
    title: 'Configure Terraform modules for VPC setup',
    type: 'Task',
    status: 'To Do',
    priority: 'Medium',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'To standardize cloud infrastructure deployment across environments, we need to design modular, reusable Terraform scripts for setting up Virtual Private Clouds (VPC). The modules must define public and private subnets across multiple availability zones, configure NAT gateways, establish internet routes, and enforce strict security group rules for inbound and outbound traffic. By replacing manual cloud console setups with version-controlled Infrastructure as Code (IaC), we ensure deterministic, reproducible environment provisioning, improve network security posture, and enable rapid disaster recovery setup for new regional deployments.',
  },
  {
    id: 'CLOUD-343',
    title: 'Fix memory leak in health check endpoint',
    type: 'Bug',
    status: 'To Do',
    priority: 'High',
    avatar: 'B',
    avatarColor: colors.error,
    description:
      'Garbage collection monitoring has identified a persistent memory leak originating from the `/healthz` microservice endpoint. Because load balancers query this endpoint every few seconds to assess pod availability, event listeners and database connection pools attached to health check handlers are not being garbage-collected properly, causing container RAM usage to steadily climb until Out-Of-Memory (OOM) pod crashes occur. The engineering team must refactor the health check route to execute lightweight, unattached system diagnostic checks, avoiding state retention and ensuring long-term container memory stability.',
  },
  {
    id: 'MOB-100',
    title: 'Offline mode support implementation',
    type: 'Story',
    status: 'To Do',
    priority: 'Medium',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'To deliver a seamless user experience in low-connectivity environment settings, the mobile application requires offline mode capabilities. This story involves setting up a local SQLite persistent cache using WatermelonDB/MMKV to save user-created data, drafts, and issue records locally when offline. When network connectivity is restored, an automated background synchronization engine will process queued local mutations against backend endpoints, resolving data conflicts via timestamp vector clocks. This improvement ensures users can view and edit critical workflow data anywhere without losing work during unexpected internet drops.',
  },
  {
    id: 'CLOUD-310',
    title: 'Set up monitoring dashboards in Grafana',
    type: 'Story',
    status: 'Done',
    priority: 'Low',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'We have successfully built comprehensive, centralized operational dashboards in Grafana to visualize key microservice performance metrics. The new dashboards track real-time CPU and memory utilization, HTTP request throughput (RPS), error rate percentages (5xx/4xx), database query execution latencies, and service response times (p95/p99). By aggregating Prometheus metrics into structured, visually intuitive panels, system administrators and developers gain instant visibility into system health, enabling proactive bottleneck identification, faster root cause analysis, and efficient capacity planning during high-traffic software events.',
  },
  {
    id: 'CLOUD-311',
    title: 'Configure alerting rules for SLA breaches',
    type: 'Task',
    status: 'Done',
    priority: 'Low',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'To guarantee compliance with our uptime service level agreements (SLAs), automated alerting rules have been implemented inside Prometheus Alertmanager and integrated with PagerDuty and Slack channels. Alerts are dynamically triggered whenever API latency exceeds target thresholds, error rates surpass 1% over a 5-minute rolling window, or database connections approach pool exhaustion limits. Clear escalation policies, severity levels, and direct links to relevant Grafana dashboards were added to alert notifications, empowering on-call engineers to triage incidents quickly before customer impact occurs.',
  },
  {
    id: 'CLOUD-312',
    title: 'Fix flaky integration tests in CI pipeline',
    type: 'Bug',
    status: 'Done',
    priority: 'Medium',
    avatar: 'B',
    avatarColor: colors.error,
    description:
      'Several automated integration tests in our CI pipeline were intermittently failing due to timing race conditions, asynchronous database cleanup issues, and external network dependency timeouts. These flaky tests caused unnecessary build retries, slowed down developer pull request workflows, and reduced confidence in build test suites. The issue was addressed by replacing fixed time delays (`sleep`) with explicit event-driven polling assertions, isolating test database transactions, and mocking volatile third-party service calls, resulting in a predictable, fast, and 100% reliable continuous integration pipeline.',
  },
  {
    id: 'SPR-1',
    title: 'OAuth token refresh failing after session timeout',
    type: 'Story',
    status: 'In Progress',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'Users who leave the application idle past the extended session timeout window encounter persistent authentication errors when returning to the app. The current token refresh logic fails to handle HTTP 403 response codes returned by the identity provider after full session expiry, resulting in unhandled promise rejections instead of redirecting the user gracefully to the sign-in screen. This story focuses on standardizing token refresh lifecycle events, clearing stale auth states, and implementing clean session expiry redirects so that users can safely re-authenticate without experiencing app freezes or broken interfaces.',
  },
  {
    id: 'SPR-2',
    title: 'Migrate auth service to new API',
    type: 'Task',
    status: 'In Progress',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'This task involves transitioning our primary authentication service integrations from legacy internal endpoints to our newly architected identity API platform. The migration requires updating authentication payloads, adopting enhanced cryptographic hashing algorithms, updating user session token schemas, and integrating multi-factor authentication (MFA) challenge hooks. Developers must ensure backward compatibility for older client versions while migrating traffic, ensuring zero user downtime. Moving to the unified API enhances system security, simplifies user identity management, and reduces infrastructure maintenance overhead across platforms.',
  },
  {
    id: 'SPR-3',
    title: 'Implement zero-downtime deployment',
    type: 'Story',
    status: 'To Do',
    priority: 'Medium',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'To achieve continuous delivery without customer interruption, this story covers configuring automated zero-downtime deployment workflows for our core services. We will configure Kubernetes rolling update strategies, readiness probes, and graceful termination handlers to ensure pods drain active connections before terminating. Additionally, database migrations will be structured as non-breaking, two-phase updates (expand-contract pattern) to support concurrent execution of old and new code versions. Implementing these deployment practices eliminates off-hours maintenance deployments and improves platform availability metrics.',
  },
  {
    id: 'SPR-4',
    title: 'Fix memory leak in health check',
    type: 'Bug',
    status: 'To Do',
    priority: 'High',
    avatar: 'B',
    avatarColor: colors.error,
    description:
      'A memory leak has been detected in the microservice health monitor route. Automated container monitoring revealed that periodic health checks fail to release memory allocated for database connection ping tests, causing node process memory footprints to expand continuously until container pods crash under OOM errors. This bug fix requires refactoring the health probe logic to use persistent connection pools and lightweight ping commands rather than spawning new database client instances on every request, ensuring memory consumption remains flat over extended operational periods.',
  },
  {
    id: 'SPR-5',
    title: 'Add rate limiting to public API',
    type: 'Story',
    status: 'To Do',
    priority: 'Medium',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'To protect our public backend endpoints against malicious DDoS attacks, scraping, and resource abuse, we are introducing a robust rate-limiting framework using Redis token bucket algorithms. The system will enforce configurable request limits based on API key tiers, client IP addresses, and user account roles. When limits are exceeded, the gateway will return standardized HTTP 429 status codes with retry headers. Implementing rate limiting safeguards system capacity, ensures fair resource distribution among API consumers, and protects database performance during sudden traffic surges.',
  },
  {
    id: 'SPR-6',
    title: 'Configure Terraform modules',
    type: 'Task',
    status: 'To Do',
    priority: 'Medium',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'This infrastructure task focuses on organizing and refactoring legacy cloud provisioning scripts into modular Terraform blueprints. We will create standardized configurations for AWS/GCP resources including Kubernetes clusters, cloud storage buckets, relational database instances (RDS), and IAM permission policies. By parameterizing environment variables across staging, testing, and production environments, infrastructure management becomes automated, auditable, and less prone to human error, allowing DevOps teams to spin up fully compliant environments rapidly using automated CI/CD jobs.',
  },
  {
    id: 'SPR-7',
    title: 'Improve error messages for Auth',
    type: 'Story',
    status: 'To Do',
    priority: 'Low',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'Current authentication error responses return generic error codes that make troubleshooting difficult for users and front-end developers alike. This story will overhaul authentication error handling across login, registration, password reset, and token verification workflows. We will map backend error codes to clear, actionable user messages (e.g., distinguishing between invalid credentials and locked accounts) while ensuring sensitive system details are not exposed to security vulnerabilities. Clear error messaging improves overall user experience and significantly decreases support ticket volumes.',
  },
  {
    id: 'SPR-8',
    title: 'Multi-region deployment support',
    type: 'Epic',
    status: 'To Do',
    priority: 'High',
    avatar: 'E',
    avatarColor: colors.accentPurple,
    description:
      'This strategic epic encompasses architectural and infrastructure initiatives required to deploy our core services across multiple geographic cloud regions simultaneously. Objectives include setting up multi-region active-active database replication, latency-based DNS routing via Cloudflare/AWS Route 53, cross-region state replication, and localized data compliance enforcement (e.g., GDPR/CCPA). Expanding to a multi-region architecture drastically reduces global network latency for international users, provides robust regional failover resilience during data center outages, and supports high-availability scale.',
  },
  {
    id: 'SPR-9',
    title: 'Real-time collaboration',
    type: 'Story',
    status: 'To Do',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
    description:
      'This feature enables real-time multi-user collaboration within issue descriptions and comment sections, similar to Google Docs. Utilizing WebSocket connections and Conflict-Free Replicated Data Types (CRDTs), multiple team members can view, edit, and comment on task details concurrently without overwriting each other’s edits. The implementation includes live presence indicators showing active user avatars, cursor location tracking, and instant optimistic UI updates. Adding real-time collaboration boosts team productivity, eliminates state sync conflicts, and makes project management interactive.',
  },
  {
    id: 'SPR-10',
    title: 'Refactor legacy authentication',
    type: 'Task',
    status: 'To Do',
    priority: 'Medium',
    avatar: 'T',
    avatarColor: colors.primary,
    description:
      'Our current authentication codebase relies on legacy session-cookie handlers that are difficult to scale across distributed microservices. This task covers refactoring legacy authentication controllers into a modern, stateless JWT-based architecture using OAuth2 and OIDC standards. Developers will decouple user credential verification logic from route handlers, write comprehensive unit test coverage for security modules, and establish clean middleware abstractions. Refactoring this module eliminates technical debt, enhances system security, and enables smooth integration with enterprise SSO providers.',
  },
  {
    id: 'SPR-11',
    title: 'Race condition in concurrent requests',
    type: 'Bug',
    status: 'To Do',
    priority: 'High',
    avatar: 'B',
    avatarColor: colors.error,
    description:
      'A race condition defect occurs when two rapid, simultaneous API calls attempt to update the same database entity record simultaneously. Because database row locks are not currently acquired during read-modify-write cycles, transaction B can overwrite changes committed by transaction A milliseconds earlier, causing silent data corruption and inconsistent application state. The engineering team must implement optimistic concurrency control using version numbers or explicit pessimistic row locking within database transactions to ensure data integrity during high-throughput parallel API requests.',
  },
];
