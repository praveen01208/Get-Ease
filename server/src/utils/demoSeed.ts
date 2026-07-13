import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

/**
 * Seeds sample courses so the platform never looks empty during development.
 * Demo courses are flagged with isDemo=true and are hidden automatically
 * once a real (non-demo) published course exists.
 */

const DEMO_COURSES = [
  {
    title: 'React — The Complete Guide',
    slug: 'react-the-complete-guide',
    subtitle: 'Build modern, blazing-fast web apps with React 19, Hooks and Router',
    description:
      'Master React from the ground up. Learn components, hooks, state management, routing and deployment while building real projects.',
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    category: 'Web Development',
    difficulty: 'Beginner',
    lessons: [
      'Introduction & Course Overview',
      'JSX and Components Deep Dive',
      'Props, State & Events',
      'Hooks: useState and useEffect',
      'Building the Project UI',
      'React Router in Practice',
      'Global State with Zustand',
      'Deploying Your App',
    ],
  },
  {
    title: 'Node.js API Masterclass',
    slug: 'nodejs-api-masterclass',
    subtitle: 'Design production-grade REST APIs with Express, Prisma and JWT',
    description:
      'Everything you need to build secure, scalable backends: routing, middleware, authentication, databases and deployment.',
    thumbnail:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=800&auto=format&fit=crop',
    category: 'Backend',
    difficulty: 'Intermediate',
    lessons: [
      'How Node.js Works',
      'Express Fundamentals',
      'REST API Design',
      'Prisma & Databases',
      'JWT Authentication',
      'Validation & Error Handling',
      'File Uploads',
      'Deployment & Scaling',
    ],
  },
  {
    title: 'Python for Everybody',
    slug: 'python-for-everybody',
    subtitle: 'From zero to automation, data and scripting mastery',
    description:
      'A friendly, project-driven introduction to Python. Learn syntax, data structures, files, APIs and automation.',
    thumbnail:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800&auto=format&fit=crop',
    category: 'Programming',
    difficulty: 'Beginner',
    lessons: [
      'Getting Started with Python',
      'Variables & Data Types',
      'Control Flow',
      'Functions & Modules',
      'Lists, Dicts & Sets',
      'Working with Files',
      'Consuming APIs',
      'Automation Projects',
    ],
  },
  {
    title: 'DSA Crash Course',
    slug: 'dsa-crash-course',
    subtitle: 'Crack coding interviews with data structures & algorithms',
    description:
      'Arrays, linked lists, trees, graphs, recursion and dynamic programming — explained visually with interview problems.',
    thumbnail:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
    category: 'Computer Science',
    difficulty: 'Advanced',
    lessons: [
      'Big-O & Complexity',
      'Arrays & Strings',
      'Linked Lists',
      'Stacks & Queues',
      'Trees & BSTs',
      'Graphs & Traversals',
      'Recursion & Backtracking',
      'Dynamic Programming',
    ],
  },
  {
    title: 'Modern JavaScript Bootcamp',
    slug: 'modern-javascript-bootcamp',
    subtitle: 'ES2024, async patterns, DOM mastery and tooling',
    description:
      'Go deep into the language that powers the web: closures, prototypes, promises, modules and the modern toolchain.',
    thumbnail:
      'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800&auto=format&fit=crop',
    category: 'Web Development',
    difficulty: 'Beginner',
    lessons: [
      'JavaScript Fundamentals',
      'Functions & Closures',
      'Objects & Prototypes',
      'The DOM in Depth',
      'Promises & Async/Await',
      'Modules & Tooling',
      'Error Handling Patterns',
      'Capstone Project',
    ],
  },
  {
    title: 'AI & Machine Learning Foundations',
    slug: 'ai-machine-learning-foundations',
    subtitle: 'Understand LLMs, neural networks and practical AI engineering',
    description:
      'A practical tour of modern AI: how models learn, prompt engineering, embeddings, and building AI-powered apps.',
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    lessons: [
      'What is Machine Learning?',
      'Neural Networks Intuition',
      'How LLMs Work',
      'Prompt Engineering',
      'Embeddings & Vector Search',
      'Building AI Apps',
      'Evaluation & Safety',
      'Shipping an AI Product',
    ],
  },
];

export const ensureDemoData = async () => {
  try {
    const demoCount = await prisma.course.count({ where: { isDemo: true } });
    if (demoCount > 0) return;

    let instructor = await prisma.user.findUnique({
      where: { email: 'instructor@getease.dev' },
    });
    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          name: 'Aarav Mehta',
          email: 'instructor@getease.dev',
          password: await bcrypt.hash('demo-instructor-password', 10),
          role: 'INSTRUCTOR',
        },
      });
    }

    for (const demo of DEMO_COURSES) {
      const catSlug = demo.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: { name: demo.category, slug: catSlug },
      });

      const existing = await prisma.course.findUnique({ where: { slug: demo.slug } });
      if (existing) continue;

      await prisma.course.create({
        data: {
          title: demo.title,
          slug: demo.slug,
          subtitle: demo.subtitle,
          description: demo.description,
          thumbnail: demo.thumbnail,
          price: 249,
          status: 'PUBLISHED',
          difficulty: demo.difficulty,
          language: 'English',
          isDemo: true,
          categoryId: category.id,
          instructorId: instructor.id,
          lessons: {
            create: demo.lessons.map((title, i) => ({
              title,
              lessonNumber: i + 1,
              order: i + 1,
              duration: 480 + ((i * 137) % 600), // 8–18 min, deterministic
              isFree: i === 0, // Lesson 1 is the free preview
              status: 'PUBLISHED',
              description: `In this lesson you will learn: ${title}.`,
              bunnyVideoId: `demo-video-${demo.slug}-${i + 1}`,
            })),
          },
        },
      });
    }

    console.log(`Seeded ${DEMO_COURSES.length} demo courses`);
  } catch (err) {
    console.error('Demo seed failed:', err);
  }
};
