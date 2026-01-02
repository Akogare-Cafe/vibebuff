import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedGlossaryTerms = mutation({
  args: {},
  handler: async (ctx) => {
    const existingTerms = await ctx.db.query("glossaryTerms").collect();
    if (existingTerms.length > 0) {
      return { message: "Glossary terms already seeded", count: existingTerms.length };
    }

    const terms = [
      {
        slug: "vibe-coding",
        term: "Vibe Coding",
        shortDefinition: "Using AI tools to write code by describing what you want in natural language.",
        fullDefinition: "Vibe coding is a modern approach to software development where you use AI-powered coding assistants to generate code by describing your intentions in plain English. Instead of writing every line manually, you collaborate with AI to build software faster.",
        eli5Definition: "It's like having a super smart helper who can write computer code for you when you just tell them what you want to build, like asking a friend to help you build a LEGO set.",
        category: "general" as const,
        relatedTerms: ["prompt", "ai-assistant", "ide"],
        toolIds: [],
        examples: ["Asking Cursor to 'create a login form with email and password'", "Telling Claude to 'add a dark mode toggle to my app'"],
        icon: "Sparkles",
        sortOrder: 1,
      },
      {
        slug: "prompt",
        term: "Prompt",
        shortDefinition: "The text instruction you give to an AI to tell it what to do.",
        fullDefinition: "A prompt is the input text you provide to an AI system to guide its response. In vibe coding, prompts are instructions that tell the AI what code to write, what problems to solve, or what changes to make. Better prompts lead to better results.",
        eli5Definition: "A prompt is like giving directions to someone. The clearer you explain where you want to go, the easier it is for them to help you get there.",
        category: "ai" as const,
        relatedTerms: ["vibe-coding", "context", "ai-assistant"],
        toolIds: [],
        examples: ["'Create a React component for a user profile card'", "'Fix the bug where the button doesn't work on mobile'"],
        icon: "MessageSquare",
        sortOrder: 2,
      },
      {
        slug: "ide",
        term: "IDE (Integrated Development Environment)",
        shortDefinition: "A software application where you write and edit code.",
        fullDefinition: "An IDE is a comprehensive software application that provides tools for writing, testing, and debugging code. Modern AI-powered IDEs like Cursor and Windsurf integrate AI assistants directly into the coding environment, making vibe coding seamless.",
        eli5Definition: "An IDE is like a special notebook for writing computer code. It helps you write neatly, catches your mistakes, and now some even have AI helpers built right in!",
        category: "ide" as const,
        relatedTerms: ["cursor", "windsurf", "vscode"],
        toolIds: [],
        examples: ["Cursor - AI-first code editor", "Windsurf - AI-powered IDE", "VS Code - Popular code editor"],
        icon: "Code",
        sortOrder: 3,
      },
      {
        slug: "mcp",
        term: "MCP (Model Context Protocol)",
        shortDefinition: "A way to give AI assistants access to external tools and data.",
        fullDefinition: "Model Context Protocol (MCP) is a standard that allows AI assistants to connect with external services, databases, and tools. It extends what AI can do by giving it access to real-time information and the ability to perform actions beyond just generating text.",
        eli5Definition: "MCP is like giving your AI helper a toolbox. Without it, they can only talk. With it, they can actually use tools to help you build things!",
        category: "ai" as const,
        relatedTerms: ["ai-assistant", "api", "integration"],
        toolIds: [],
        examples: ["Connecting AI to your database", "Letting AI deploy your code", "Giving AI access to documentation"],
        icon: "Plug",
        sortOrder: 4,
      },
      {
        slug: "llm",
        term: "LLM (Large Language Model)",
        shortDefinition: "The AI brain that powers coding assistants like Claude and GPT.",
        fullDefinition: "A Large Language Model is an AI system trained on vast amounts of text data that can understand and generate human-like text. LLMs like Claude, GPT-4, and others power the AI coding assistants used in vibe coding.",
        eli5Definition: "An LLM is like a really smart robot brain that has read millions of books and can help you write things, including computer code!",
        category: "ai" as const,
        relatedTerms: ["claude", "gpt", "ai-assistant"],
        toolIds: [],
        examples: ["Claude by Anthropic", "GPT-4 by OpenAI", "Gemini by Google"],
        icon: "Brain",
        sortOrder: 5,
      },
      {
        slug: "api",
        term: "API (Application Programming Interface)",
        shortDefinition: "A way for different software programs to talk to each other.",
        fullDefinition: "An API is a set of rules and protocols that allows different software applications to communicate. When building apps with vibe coding, you'll often use APIs to connect to services like databases, payment processors, or AI models.",
        eli5Definition: "An API is like a waiter at a restaurant. You tell the waiter what you want, they go to the kitchen, and bring back your food. The API takes your request to another program and brings back the answer.",
        category: "backend" as const,
        relatedTerms: ["rest", "endpoint", "request"],
        toolIds: [],
        examples: ["Stripe API for payments", "OpenAI API for AI features", "Convex API for database"],
        icon: "Plug",
        sortOrder: 6,
      },
      {
        slug: "frontend",
        term: "Frontend",
        shortDefinition: "The part of a website or app that users see and interact with.",
        fullDefinition: "Frontend refers to the user interface and user experience aspects of an application - everything the user sees and interacts with in their browser or app. This includes buttons, forms, layouts, and visual design.",
        eli5Definition: "The frontend is like the outside of a house - the paint, the door, the windows. It's everything you can see and touch when you visit.",
        category: "frontend" as const,
        relatedTerms: ["react", "ui", "css"],
        toolIds: [],
        examples: ["A login form", "A navigation menu", "A product card"],
        icon: "Monitor",
        sortOrder: 7,
      },
      {
        slug: "backend",
        term: "Backend",
        shortDefinition: "The behind-the-scenes part of an app that handles data and logic.",
        fullDefinition: "Backend refers to the server-side of an application - the code that runs on servers, handles data storage, processes business logic, and communicates with databases. Users don't see the backend directly.",
        eli5Definition: "The backend is like the kitchen in a restaurant. Customers don't see it, but that's where all the food gets made and stored.",
        category: "backend" as const,
        relatedTerms: ["api", "database", "server"],
        toolIds: [],
        examples: ["User authentication logic", "Database queries", "Payment processing"],
        icon: "Server",
        sortOrder: 8,
      },
      {
        slug: "database",
        term: "Database",
        shortDefinition: "A organized collection of data that your app can store and retrieve.",
        fullDefinition: "A database is a structured system for storing, organizing, and retrieving data. Apps use databases to persist information like user accounts, posts, orders, and any other data that needs to be saved.",
        eli5Definition: "A database is like a super organized filing cabinet for your app. It remembers everything - like who signed up, what they bought, and what they posted.",
        category: "database" as const,
        relatedTerms: ["sql", "convex", "supabase"],
        toolIds: [],
        examples: ["Storing user profiles", "Saving blog posts", "Tracking orders"],
        icon: "Database",
        sortOrder: 9,
      },
      {
        slug: "deployment",
        term: "Deployment",
        shortDefinition: "Making your app available on the internet for others to use.",
        fullDefinition: "Deployment is the process of publishing your application to a server or hosting platform so that users can access it via the internet. Modern platforms like Vercel and Netlify make deployment simple.",
        eli5Definition: "Deployment is like opening your lemonade stand. You've made the lemonade (your app), now you're putting it out on the street so people can actually buy it!",
        category: "devops" as const,
        relatedTerms: ["vercel", "netlify", "hosting"],
        toolIds: [],
        examples: ["Deploying to Vercel", "Publishing to Netlify", "Hosting on Railway"],
        icon: "Rocket",
        sortOrder: 10,
      },
    ];

    for (const term of terms) {
      await ctx.db.insert("glossaryTerms", term);
    }

    return { message: "Glossary terms seeded successfully", count: terms.length };
  },
});

export const seedLearningPaths = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPaths = await ctx.db.query("learningPaths").collect();
    if (existingPaths.length > 0) {
      return { message: "Learning paths already seeded", count: existingPaths.length };
    }

    const paths = [
      {
        slug: "vibe-coding-fundamentals",
        title: "Vibe Coding Fundamentals",
        description: "Learn the basics of AI-assisted coding. Perfect for complete beginners with no coding experience.",
        difficulty: "beginner" as const,
        estimatedMinutes: 60,
        icon: "Sparkles",
        color: "#22c55e",
        prerequisites: [],
        toolIds: [],
        xpReward: 500,
        isPublished: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        slug: "mastering-cursor",
        title: "Mastering Cursor IDE",
        description: "Deep dive into Cursor, the AI-first code editor. Learn all the features and shortcuts.",
        difficulty: "beginner" as const,
        estimatedMinutes: 90,
        icon: "Code",
        color: "#3b82f6",
        prerequisites: ["vibe-coding-fundamentals"],
        toolIds: [],
        xpReward: 750,
        isPublished: true,
        sortOrder: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        slug: "prompt-engineering-101",
        title: "Prompt Engineering 101",
        description: "Learn to write effective prompts that get the results you want from AI coding assistants.",
        difficulty: "beginner" as const,
        estimatedMinutes: 45,
        icon: "MessageSquare",
        color: "#a855f7",
        prerequisites: [],
        toolIds: [],
        xpReward: 400,
        isPublished: true,
        sortOrder: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        slug: "build-your-first-app",
        title: "Build Your First App",
        description: "A hands-on project where you build a complete web app using vibe coding techniques.",
        difficulty: "intermediate" as const,
        estimatedMinutes: 120,
        icon: "Rocket",
        color: "#f59e0b",
        prerequisites: ["vibe-coding-fundamentals", "prompt-engineering-101"],
        toolIds: [],
        xpReward: 1000,
        isPublished: true,
        sortOrder: 4,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        slug: "mcp-deep-dive",
        title: "MCP Deep Dive",
        description: "Learn to extend your AI assistant's capabilities with Model Context Protocol integrations.",
        difficulty: "advanced" as const,
        estimatedMinutes: 90,
        icon: "Plug",
        color: "#ec4899",
        prerequisites: ["mastering-cursor"],
        toolIds: [],
        xpReward: 800,
        isPublished: true,
        sortOrder: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const pathIds: Record<string, string> = {};

    for (const path of paths) {
      const id = await ctx.db.insert("learningPaths", path);
      pathIds[path.slug] = id;
    }

    const lessons = [
      {
        pathSlug: "vibe-coding-fundamentals",
        lessons: [
          {
            slug: "what-is-vibe-coding",
            title: "What is Vibe Coding?",
            description: "Introduction to AI-assisted coding and why it's changing how we build software.",
            content: "In this lesson, you'll learn what vibe coding is and how it's revolutionizing software development...",
            lessonType: "article" as const,
            estimatedMinutes: 10,
            sortOrder: 1,
            xpReward: 50,
          },
          {
            slug: "choosing-your-tools",
            title: "Choosing Your Tools",
            description: "Overview of the best AI coding tools for beginners.",
            content: "Let's explore the tools you'll need to start vibe coding...",
            lessonType: "article" as const,
            estimatedMinutes: 15,
            sortOrder: 2,
            xpReward: 50,
          },
          {
            slug: "your-first-prompt",
            title: "Writing Your First Prompt",
            description: "Hands-on practice writing prompts that work.",
            content: "Time to write your first prompt and see AI coding in action...",
            lessonType: "interactive" as const,
            estimatedMinutes: 20,
            sortOrder: 3,
            xpReward: 100,
          },
          {
            slug: "fundamentals-quiz",
            title: "Knowledge Check",
            description: "Test your understanding of vibe coding basics.",
            content: "Let's make sure you've got the fundamentals down...",
            lessonType: "quiz" as const,
            estimatedMinutes: 10,
            sortOrder: 4,
            xpReward: 100,
          },
        ],
      },
      {
        pathSlug: "prompt-engineering-101",
        lessons: [
          {
            slug: "anatomy-of-a-prompt",
            title: "Anatomy of a Good Prompt",
            description: "Learn the key components that make prompts effective.",
            content: "A good prompt has several key elements...",
            lessonType: "article" as const,
            estimatedMinutes: 10,
            sortOrder: 1,
            xpReward: 50,
          },
          {
            slug: "context-is-king",
            title: "Context is King",
            description: "How to provide the right context for better results.",
            content: "The more context you give, the better results you get...",
            lessonType: "article" as const,
            estimatedMinutes: 15,
            sortOrder: 2,
            xpReward: 50,
          },
          {
            slug: "prompt-patterns",
            title: "Common Prompt Patterns",
            description: "Templates and patterns for common coding tasks.",
            content: "Here are proven patterns you can use...",
            lessonType: "interactive" as const,
            estimatedMinutes: 20,
            sortOrder: 3,
            xpReward: 100,
          },
        ],
      },
    ];

    for (const pathLessons of lessons) {
      const pathId = pathIds[pathLessons.pathSlug];
      if (pathId) {
        for (const lesson of pathLessons.lessons) {
          await ctx.db.insert("learningLessons", {
            pathId: pathId as any,
            ...lesson,
          });
        }
      }
    }

    return { message: "Learning paths and lessons seeded successfully", count: paths.length };
  },
});

export const seedPromptTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const existingTemplates = await ctx.db.query("promptTemplates").collect();
    if (existingTemplates.length > 0) {
      return { message: "Prompt templates already seeded", count: existingTemplates.length };
    }

    const templates = [
      {
        slug: "create-landing-page",
        title: "Create a Landing Page",
        description: "Generate a complete landing page with hero, features, and CTA sections.",
        category: "landing-page" as const,
        prompt: "Create a modern landing page for [PRODUCT_NAME] with:\n- A hero section with headline, subheadline, and CTA button\n- A features section with 3-4 key features using icons\n- A testimonials section\n- A pricing section with 3 tiers\n- A footer with links\n\nUse Tailwind CSS for styling. Make it responsive and visually appealing with a [COLOR_SCHEME] color scheme.",
        exampleOutput: "A complete React component with all sections...",
        difficulty: "beginner" as const,
        toolIds: [],
        tags: ["landing-page", "react", "tailwind"],
        usageCount: 0,
        rating: 0,
        isOfficial: true,
        createdAt: Date.now(),
      },
      {
        slug: "add-authentication",
        title: "Add User Authentication",
        description: "Implement user login and signup functionality.",
        category: "authentication" as const,
        prompt: "Add user authentication to my app using [AUTH_PROVIDER]. Include:\n- Sign up form with email and password\n- Login form\n- Password reset functionality\n- Protected routes that require authentication\n- User session management\n\nUse best practices for security.",
        difficulty: "intermediate" as const,
        toolIds: [],
        tags: ["auth", "security", "clerk"],
        usageCount: 0,
        rating: 0,
        isOfficial: true,
        createdAt: Date.now(),
      },
      {
        slug: "create-crud-api",
        title: "Create CRUD API Endpoints",
        description: "Generate API endpoints for create, read, update, delete operations.",
        category: "api" as const,
        prompt: "Create CRUD API endpoints for a [RESOURCE_NAME] resource with the following fields:\n[FIELDS]\n\nInclude:\n- GET /[resource] - List all with pagination\n- GET /[resource]/:id - Get single item\n- POST /[resource] - Create new item with validation\n- PUT /[resource]/:id - Update existing item\n- DELETE /[resource]/:id - Delete item\n\nAdd proper error handling and input validation.",
        difficulty: "intermediate" as const,
        toolIds: [],
        tags: ["api", "crud", "backend"],
        usageCount: 0,
        rating: 0,
        isOfficial: true,
        createdAt: Date.now(),
      },
      {
        slug: "fix-bug",
        title: "Debug and Fix Issue",
        description: "Get help identifying and fixing bugs in your code.",
        category: "debugging" as const,
        prompt: "I'm getting this error:\n[ERROR_MESSAGE]\n\nHere's the relevant code:\n[CODE]\n\nPlease:\n1. Explain what's causing the error\n2. Provide the fix\n3. Explain why the fix works\n4. Suggest how to prevent similar issues",
        difficulty: "beginner" as const,
        toolIds: [],
        tags: ["debugging", "error", "fix"],
        usageCount: 0,
        rating: 0,
        isOfficial: true,
        createdAt: Date.now(),
      },
      {
        slug: "add-dark-mode",
        title: "Add Dark Mode Toggle",
        description: "Implement a dark/light mode theme switcher.",
        category: "styling" as const,
        prompt: "Add a dark mode toggle to my [FRAMEWORK] app. Include:\n- A toggle button/switch component\n- CSS variables for light and dark themes\n- Persist user preference in localStorage\n- Respect system preference by default\n- Smooth transition between themes\n\nUse Tailwind CSS dark: classes if applicable.",
        difficulty: "beginner" as const,
        toolIds: [],
        tags: ["dark-mode", "theme", "tailwind"],
        usageCount: 0,
        rating: 0,
        isOfficial: true,
        createdAt: Date.now(),
      },
      {
        slug: "write-tests",
        title: "Write Unit Tests",
        description: "Generate comprehensive unit tests for your code.",
        category: "testing" as const,
        prompt: "Write unit tests for this code:\n[CODE]\n\nInclude tests for:\n- Happy path scenarios\n- Edge cases\n- Error handling\n- Input validation\n\nUse [TESTING_FRAMEWORK] and follow testing best practices.",
        difficulty: "intermediate" as const,
        toolIds: [],
        tags: ["testing", "unit-tests", "jest"],
        usageCount: 0,
        rating: 0,
        isOfficial: true,
        createdAt: Date.now(),
      },
    ];

    for (const template of templates) {
      await ctx.db.insert("promptTemplates", template);
    }

    return { message: "Prompt templates seeded successfully", count: templates.length };
  },
});

export const seedVideoTutorials = mutation({
  args: {},
  handler: async (ctx) => {
    const existingVideos = await ctx.db.query("videoTutorials").collect();
    if (existingVideos.length > 0) {
      return { message: "Video tutorials already seeded", count: existingVideos.length };
    }

    const videos = [
      {
        title: "Getting Started with Cursor IDE",
        description: "A complete beginner's guide to setting up and using Cursor, the AI-first code editor.",
        youtubeId: "dQw4w9WgXcQ",
        duration: 900,
        difficulty: "beginner" as const,
        category: "setup" as const,
        toolIds: [],
        tags: ["cursor", "setup", "beginner"],
        authorName: "VibeBuff Official",
        views: 0,
        likes: 0,
        isOfficial: true,
        isFeatured: true,
        publishedAt: Date.now(),
        createdAt: Date.now(),
      },
      {
        title: "Prompt Engineering for Developers",
        description: "Learn how to write prompts that get the results you want from AI coding assistants.",
        youtubeId: "dQw4w9WgXcQ",
        duration: 1200,
        difficulty: "beginner" as const,
        category: "prompting" as const,
        toolIds: [],
        tags: ["prompts", "tips", "beginner"],
        authorName: "VibeBuff Official",
        views: 0,
        likes: 0,
        isOfficial: true,
        isFeatured: true,
        publishedAt: Date.now(),
        createdAt: Date.now(),
      },
      {
        title: "Build a Full Stack App with AI",
        description: "Watch as we build a complete web application using only AI assistance.",
        youtubeId: "dQw4w9WgXcQ",
        duration: 2400,
        difficulty: "intermediate" as const,
        category: "build-along" as const,
        toolIds: [],
        tags: ["build-along", "full-stack", "project"],
        authorName: "VibeBuff Official",
        views: 0,
        likes: 0,
        isOfficial: true,
        isFeatured: true,
        publishedAt: Date.now(),
        createdAt: Date.now(),
      },
      {
        title: "Setting Up MCP with Cursor",
        description: "Learn how to configure Model Context Protocol to supercharge your AI assistant.",
        youtubeId: "dQw4w9WgXcQ",
        duration: 600,
        difficulty: "intermediate" as const,
        category: "mcp" as const,
        toolIds: [],
        tags: ["mcp", "cursor", "setup"],
        authorName: "VibeBuff Official",
        views: 0,
        likes: 0,
        isOfficial: true,
        isFeatured: false,
        publishedAt: Date.now(),
        createdAt: Date.now(),
      },
      {
        title: "10 Tips for Better AI Code Generation",
        description: "Quick tips and tricks to get better results from your AI coding assistant.",
        youtubeId: "dQw4w9WgXcQ",
        duration: 480,
        difficulty: "beginner" as const,
        category: "tips" as const,
        toolIds: [],
        tags: ["tips", "productivity", "beginner"],
        authorName: "VibeBuff Official",
        views: 0,
        likes: 0,
        isOfficial: true,
        isFeatured: false,
        publishedAt: Date.now(),
        createdAt: Date.now(),
      },
    ];

    for (const video of videos) {
      await ctx.db.insert("videoTutorials", video);
    }

    return { message: "Video tutorials seeded successfully", count: videos.length };
  },
});

export const seedAllEducationalContent = mutation({
  args: {},
  handler: async (ctx) => {
    return { message: "Use individual seed functions to seed content" };
  },
});
