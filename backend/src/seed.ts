import prisma from './config/prisma';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Password123!', 12);

  // ─── USERS ──────────────────────────────────────────────
  console.log('👤 Creating users...');

  const admin = await prisma.user.create({
    data: { name: 'Saurabh Kumar', email: 'admin@taskflow.com', passwordHash: hash, systemRole: 'ADMIN' },
  });

  const alice = await prisma.user.create({
    data: { name: 'Alice Johnson', email: 'alice@taskflow.com', passwordHash: hash, systemRole: 'USER' },
  });

  const bob = await prisma.user.create({
    data: { name: 'Bob Williams', email: 'bob@taskflow.com', passwordHash: hash, systemRole: 'USER' },
  });

  const carol = await prisma.user.create({
    data: { name: 'Carol Davis', email: 'carol@taskflow.com', passwordHash: hash, systemRole: 'USER' },
  });

  const dave = await prisma.user.create({
    data: { name: 'Dave Martinez', email: 'dave@taskflow.com', passwordHash: hash, systemRole: 'USER' },
  });

  const eve = await prisma.user.create({
    data: { name: 'Eve Chen', email: 'eve@taskflow.com', passwordHash: hash, systemRole: 'USER' },
  });

  console.log(`   ✅ 6 users created`);

  // ─── PROJECT 1: E-Commerce Platform ─────────────────────
  console.log('📂 Creating projects...');

  const proj1 = await prisma.project.create({
    data: { name: 'E-Commerce Platform Redesign', description: 'Complete overhaul of the customer-facing e-commerce platform with modern UI, improved checkout flow, and mobile responsiveness.', ownerId: admin.id },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: admin.id, projectId: proj1.id, role: 'MANAGER' },
      { userId: alice.id, projectId: proj1.id, role: 'MEMBER' },
      { userId: bob.id, projectId: proj1.id, role: 'MEMBER' },
      { userId: carol.id, projectId: proj1.id, role: 'MEMBER' },
    ],
  });

  // Project 1 Tasks
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysLater = (d: number) => new Date(now.getTime() + d * 86400000);

  const t1 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Design new product listing page', description: 'Create Figma mockups for the redesigned product listing page with filters, sorting, and grid/list toggle.', status: 'DONE', priority: 'HIGH', assigneeId: alice.id, dueDate: daysAgo(3), createdAt: daysAgo(15) },
  });

  const t2 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Implement responsive navigation bar', description: 'Build the top navigation with mega menu, search bar, cart icon with count badge, and mobile hamburger menu.', status: 'DONE', priority: 'HIGH', assigneeId: bob.id, dueDate: daysAgo(5), createdAt: daysAgo(14) },
  });

  const t3 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Build shopping cart component', description: 'Implement add-to-cart, quantity update, remove item, and cart total calculation with local storage persistence.', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: alice.id, dueDate: daysLater(2), createdAt: daysAgo(10) },
  });

  const t4 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Integrate Stripe payment gateway', description: 'Set up Stripe checkout with card payments, error handling, and webhook for order confirmation.', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: bob.id, dueDate: daysLater(5), createdAt: daysAgo(8) },
  });

  const t5 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Create order history page', description: 'Display past orders with status tracking, invoice download, and reorder functionality.', status: 'TODO', priority: 'MEDIUM', assigneeId: carol.id, dueDate: daysLater(10), createdAt: daysAgo(5) },
  });

  const t6 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Add product review system', description: 'Allow users to rate products (1-5 stars), write reviews, upload photos, and mark reviews as helpful.', status: 'TODO', priority: 'LOW', assigneeId: null, dueDate: daysLater(14), createdAt: daysAgo(3) },
  });

  const t7 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Optimize images for performance', description: 'Implement lazy loading, WebP format conversion, and responsive image srcsets for all product images.', status: 'TODO', priority: 'MEDIUM', assigneeId: alice.id, dueDate: daysLater(7), createdAt: daysAgo(2) },
  });

  const t8 = await prisma.task.create({
    data: { projectId: proj1.id, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging/production.', status: 'DONE', priority: 'HIGH', assigneeId: bob.id, dueDate: daysAgo(7), createdAt: daysAgo(20) },
  });

  // Overdue task
  await prisma.task.create({
    data: { projectId: proj1.id, title: 'Write API documentation', description: 'Document all REST API endpoints using Swagger/OpenAPI spec with request/response examples.', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: carol.id, dueDate: daysAgo(1), createdAt: daysAgo(7) },
  });

  // Due today
  await prisma.task.create({
    data: { projectId: proj1.id, title: 'Fix mobile checkout bug', description: 'Payment button is not clickable on iOS Safari when keyboard is open. Investigate and fix.', status: 'TODO', priority: 'HIGH', assigneeId: alice.id, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59), createdAt: daysAgo(1) },
  });

  // ─── PROJECT 2: Mobile App Backend ──────────────────────
  const proj2 = await prisma.project.create({
    data: { name: 'Mobile App Backend API', description: 'RESTful API backend for the iOS and Android mobile application. Includes user auth, push notifications, and real-time chat.', ownerId: alice.id },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: alice.id, projectId: proj2.id, role: 'MANAGER' },
      { userId: admin.id, projectId: proj2.id, role: 'MEMBER' },
      { userId: dave.id, projectId: proj2.id, role: 'MEMBER' },
      { userId: eve.id, projectId: proj2.id, role: 'MEMBER' },
    ],
  });

  const t2_1 = await prisma.task.create({
    data: { projectId: proj2.id, title: 'Design database schema', description: 'Create ERD and implement PostgreSQL schema for users, chats, messages, notifications tables.', status: 'DONE', priority: 'HIGH', assigneeId: admin.id, dueDate: daysAgo(10), createdAt: daysAgo(18) },
  });

  await prisma.task.create({
    data: { projectId: proj2.id, title: 'Implement JWT authentication', description: 'Build signup, login, password reset endpoints with bcrypt hashing and JWT token management.', status: 'DONE', priority: 'HIGH', assigneeId: dave.id, dueDate: daysAgo(7), createdAt: daysAgo(15) },
  });

  await prisma.task.create({
    data: { projectId: proj2.id, title: 'Build push notification service', description: 'Integrate Firebase Cloud Messaging for Android and APNs for iOS push notifications.', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: eve.id, dueDate: daysLater(3), createdAt: daysAgo(6) },
  });

  await prisma.task.create({
    data: { projectId: proj2.id, title: 'Create WebSocket chat server', description: 'Real-time messaging with Socket.io including typing indicators, read receipts, and message history.', status: 'TODO', priority: 'HIGH', assigneeId: dave.id, dueDate: daysLater(8), createdAt: daysAgo(4) },
  });

  await prisma.task.create({
    data: { projectId: proj2.id, title: 'Set up rate limiting', description: 'Implement API rate limiting with Redis to prevent abuse. 100 req/min for auth, 1000 req/min for data.', status: 'TODO', priority: 'LOW', assigneeId: admin.id, dueDate: daysLater(12), createdAt: daysAgo(2) },
  });

  await prisma.task.create({
    data: { projectId: proj2.id, title: 'Write unit tests for auth module', description: 'Cover register, login, token refresh, and password reset flows with Jest. Target 90%+ coverage.', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: eve.id, dueDate: daysLater(4), createdAt: daysAgo(3) },
  });

  // ─── PROJECT 3: Marketing Dashboard ─────────────────────
  const proj3 = await prisma.project.create({
    data: { name: 'Q3 Marketing Dashboard', description: 'Analytics dashboard for tracking Q3 marketing campaign performance across all channels — social media, email, PPC, and content.', ownerId: admin.id },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: admin.id, projectId: proj3.id, role: 'MANAGER' },
      { userId: carol.id, projectId: proj3.id, role: 'MANAGER' },
      { userId: bob.id, projectId: proj3.id, role: 'MEMBER' },
      { userId: eve.id, projectId: proj3.id, role: 'MEMBER' },
    ],
  });

  await prisma.task.create({
    data: { projectId: proj3.id, title: 'Design dashboard wireframes', description: 'Create low-fi and high-fi wireframes for the main dashboard, campaign detail, and ROI comparison views.', status: 'DONE', priority: 'HIGH', assigneeId: carol.id, dueDate: daysAgo(8), createdAt: daysAgo(16) },
  });

  await prisma.task.create({
    data: { projectId: proj3.id, title: 'Build chart components with Chart.js', description: 'Implement reusable chart components — bar, line, pie, and funnel charts with dynamic data binding.', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: bob.id, dueDate: daysLater(3), createdAt: daysAgo(8) },
  });

  await prisma.task.create({
    data: { projectId: proj3.id, title: 'Integrate Google Analytics API', description: 'Fetch campaign performance data from GA4 using the Data API. Display page views, sessions, and conversions.', status: 'TODO', priority: 'MEDIUM', assigneeId: eve.id, dueDate: daysLater(6), createdAt: daysAgo(4) },
  });

  await prisma.task.create({
    data: { projectId: proj3.id, title: 'Create email campaign report', description: 'Show open rates, click rates, unsubscribes, and A/B test results for Mailchimp campaigns.', status: 'TODO', priority: 'LOW', assigneeId: bob.id, dueDate: daysLater(15), createdAt: daysAgo(2) },
  });

  await prisma.task.create({
    data: { projectId: proj3.id, title: 'Add PDF export functionality', description: 'Allow users to export any dashboard view as a styled PDF report with company branding.', status: 'TODO', priority: 'LOW', assigneeId: null, dueDate: daysLater(20), createdAt: daysAgo(1) },
  });

  // ─── PROJECT 4: Archived project ────────────────────────
  const proj4 = await prisma.project.create({
    data: { name: 'Legacy System Migration', description: 'Migration of the old PHP monolith to microservices architecture. Completed in Q2.', ownerId: admin.id, status: 'ARCHIVED' },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: admin.id, projectId: proj4.id, role: 'MANAGER' },
      { userId: alice.id, projectId: proj4.id, role: 'MEMBER' },
    ],
  });

  await prisma.task.create({
    data: { projectId: proj4.id, title: 'Migrate user service', status: 'DONE', priority: 'HIGH', assigneeId: alice.id, dueDate: daysAgo(30), createdAt: daysAgo(60) },
  });

  await prisma.task.create({
    data: { projectId: proj4.id, title: 'Migrate payment service', status: 'DONE', priority: 'HIGH', assigneeId: admin.id, dueDate: daysAgo(25), createdAt: daysAgo(55) },
  });

  await prisma.task.create({
    data: { projectId: proj4.id, title: 'Decommission old servers', status: 'DONE', priority: 'MEDIUM', assigneeId: admin.id, dueDate: daysAgo(20), createdAt: daysAgo(40) },
  });

  console.log(`   ✅ 4 projects created`);
  console.log(`   ✅ 24 tasks created`);

  // ─── COMMENTS ───────────────────────────────────────────
  console.log('💬 Creating comments...');

  await prisma.comment.createMany({
    data: [
      { taskId: t1.id, authorId: alice.id, content: 'I\'ve completed the initial mockups. Please review the Figma link shared in Slack.', createdAt: daysAgo(5) },
      { taskId: t1.id, authorId: admin.id, content: 'Looks great! Can we add a "Recently Viewed" section below the filters?', createdAt: daysAgo(4) },
      { taskId: t1.id, authorId: alice.id, content: 'Done! Updated the mockups with the recently viewed section. Moving this to Done.', createdAt: daysAgo(3) },

      { taskId: t3.id, authorId: alice.id, content: 'Cart component is 70% done. Working on the quantity update logic now.', createdAt: daysAgo(2) },
      { taskId: t3.id, authorId: bob.id, content: 'Make sure to persist cart state in localStorage so it survives page refresh.', createdAt: daysAgo(1) },
      { taskId: t3.id, authorId: alice.id, content: 'Good point! I\'ll add that today. Also adding a "Save for Later" feature.', createdAt: new Date() },

      { taskId: t4.id, authorId: bob.id, content: 'Stripe test keys are set up. Starting webhook integration for payment confirmations.', createdAt: daysAgo(3) },
      { taskId: t4.id, authorId: admin.id, content: 'Don\'t forget to handle card declined and 3D Secure authentication scenarios.', createdAt: daysAgo(2) },

      { taskId: t5.id, authorId: carol.id, content: 'Should we include a reorder button that adds all items from a past order to the current cart?', createdAt: daysAgo(1) },
      { taskId: t5.id, authorId: admin.id, content: 'Yes, great idea. Also add a "Track Order" link that shows shipping status.', createdAt: new Date() },

      { taskId: t2_1.id, authorId: admin.id, content: 'Schema is finalized and reviewed. All indexes are in place for query performance.', createdAt: daysAgo(10) },
      { taskId: t2_1.id, authorId: dave.id, content: 'The ERD looks solid. I\'ll start building the auth endpoints based on this schema.', createdAt: daysAgo(9) },
    ],
  });

  console.log(`   ✅ 12 comments created`);

  // ─── ACTIVITY LOGS ──────────────────────────────────────
  console.log('📝 Creating activity logs...');

  const logs = [
    { userId: admin.id, entityType: 'PROJECT', entityId: proj1.id, action: 'CREATED', metadata: { name: proj1.name }, createdAt: daysAgo(20) },
    { userId: admin.id, entityType: 'TASK', entityId: t1.id, action: 'CREATED', metadata: { title: 'Design new product listing page' }, createdAt: daysAgo(15) },
    { userId: alice.id, entityType: 'TASK', entityId: t1.id, action: 'STATUS_UPDATED', metadata: { from: 'TODO', to: 'IN_PROGRESS' }, createdAt: daysAgo(10) },
    { userId: alice.id, entityType: 'TASK', entityId: t1.id, action: 'STATUS_UPDATED', metadata: { from: 'IN_PROGRESS', to: 'DONE' }, createdAt: daysAgo(3) },
    { userId: bob.id, entityType: 'TASK', entityId: t2.id, action: 'STATUS_UPDATED', metadata: { from: 'IN_PROGRESS', to: 'DONE' }, createdAt: daysAgo(5) },
    { userId: admin.id, entityType: 'PROJECT', entityId: proj1.id, action: 'MEMBER_ADDED', metadata: { memberId: carol.id, role: 'MEMBER' }, createdAt: daysAgo(18) },
    { userId: alice.id, entityType: 'TASK', entityId: t3.id, action: 'STATUS_UPDATED', metadata: { from: 'TODO', to: 'IN_PROGRESS' }, createdAt: daysAgo(4) },
    { userId: bob.id, entityType: 'TASK', entityId: t4.id, action: 'CREATED', metadata: { title: 'Integrate Stripe payment gateway' }, createdAt: daysAgo(8) },
    { userId: admin.id, entityType: 'TASK', entityId: t8.id, action: 'STATUS_UPDATED', metadata: { from: 'IN_PROGRESS', to: 'DONE' }, createdAt: daysAgo(7) },
    { userId: carol.id, entityType: 'TASK', entityId: t5.id, action: 'COMMENT_ADDED', metadata: { commentId: 'demo' }, createdAt: daysAgo(1) },
    { userId: admin.id, entityType: 'PROJECT', entityId: proj2.id, action: 'CREATED', metadata: { name: proj2.name }, createdAt: daysAgo(18) },
    { userId: admin.id, entityType: 'PROJECT', entityId: proj3.id, action: 'CREATED', metadata: { name: proj3.name }, createdAt: daysAgo(16) },
    { userId: eve.id, entityType: 'TASK', entityId: t2_1.id, action: 'COMMENT_ADDED', metadata: {}, createdAt: daysAgo(2) },
    { userId: admin.id, entityType: 'PROJECT', entityId: proj4.id, action: 'UPDATED', metadata: { status: 'ARCHIVED' }, createdAt: daysAgo(15) },
  ];

  await prisma.activityLog.createMany({ data: logs as any });

  console.log(`   ✅ ${logs.length} activity logs created`);

  // ─── SUMMARY ────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('🎉 Seeding complete!\n');
  console.log('📧 Demo Login Accounts:');
  console.log('   ┌────────────────────────────────────────┐');
  console.log('   │  ADMIN:  admin@taskflow.com             │');
  console.log('   │  USER:   alice@taskflow.com             │');
  console.log('   │  USER:   bob@taskflow.com               │');
  console.log('   │  USER:   carol@taskflow.com             │');
  console.log('   │  USER:   dave@taskflow.com              │');
  console.log('   │  USER:   eve@taskflow.com               │');
  console.log('   │                                        │');
  console.log('   │  Password for ALL: Password123!         │');
  console.log('   └────────────────────────────────────────┘');
  console.log('═══════════════════════════════════════════\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
