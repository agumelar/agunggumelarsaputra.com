# Personal Website Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun personal website dengan Astro + TailwindCSS + Decap CMS + Giscus

**Architecture:** Static site dengan MDX blog system, CMS untuk content management, dan GitHub Discussions untuk comments

**Tech Stack:** Astro, TailwindCSS, Decap CMS, Giscus

---

## File Structure

```
/var/www/agunggumelarsaputra.com/
├── src/
│   ├── components/
│   │   ├── Navigation.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Skills.astro
│   │   ├── BlogCard.astro
│   │   ├── TableOfContents.astro
│   │   ├── SocialShare.astro
│   │   ├── ContactForm.astro
│   │   └── CVSection.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── BlogPostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── cv.astro
│   │   ├── contact.astro
│   │   └── admin/
│   │       └── index.html
│   ├── content/
│   │   ├── config.ts
│   │   └── blog/
│   │       └── (markdown files)
│   └── styles/
│       └── global.css
├── public/
│   ├── images/
│   │   └── profile.jpg
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── tsconfig.json
```

---

## Task List

### Task 1: Setup Project - Install Astro + TailwindCSS

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Buat package.json**

```json
{
  "name": "agunggumelarsaputra.com",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd /var/www/agunggumelarsaputra.com && npm install`

- [ ] **Step 3: Buat astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://agunggumelarsaputra.com',
});
```

- [ ] **Step 4: Buat tailwind.config.mjs**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#141414',
          tertiary: '#1f1f1f',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
        },
        accent: {
          primary: '#2563eb',
          hover: '#1d4ed8',
        },
        border: '#262626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Buat tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: Commit**

---

### Task 2: Setup Global Styles & Base Layout

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Buat src/styles/global.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-bg-primary text-text-primary font-sans;
  }
  
  h1 { @apply text-5xl font-bold; }
  h2 { @apply text-3xl font-semibold; }
  h3 { @apply text-xl font-semibold; }
  p { @apply text-base text-text-secondary leading-relaxed; }
  
  a {
    @apply text-accent-primary hover:text-accent-hover transition-colors;
  }
}

@layer components {
  .container-main {
    @apply max-w-6xl mx-auto px-4;
  }
  
  .container-content {
    @apply max-w-3xl mx-auto px-4;
  }
}
```

- [ ] **Step 2: Buat src/layouts/BaseLayout.astro**

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = "Website Personal Agung Gumelar Saputra" } = Astro.props;
---

<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="description" content={description} />
    <title>{title} | Agung Gumelar Saputra</title>
  </head>
  <body class="min-h-screen flex flex-col">
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Commit**

---

### Task 3: Create Components - Navigation & Footer

**Files:**
- Create: `src/components/Navigation.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Buat src/components/Navigation.astro**

```astro
---
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/cv', label: 'CV' },
  { href: '/contact', label: 'Contact' },
];

const currentPath = Astro.url.pathname;
---

<header class="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
  <nav class="container-main flex items-center justify-between h-16">
    <a href="/" class="text-xl font-bold text-accent-primary">
      AGS
    </a>
    
    <ul class="flex items-center gap-6">
      {navItems.map((item) => (
        <li>
          <a 
            href={item.href}
            class:list={[
              "text-sm font-medium transition-colors",
              currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
                ? "text-accent-primary"
                : "text-text-secondary hover:text-text-primary"
            ]}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

- [ ] **Step 2: Buat src/components/Footer.astro**

```astro
---
const socialLinks = [
  { href: 'https://github.com/agumelar', label: 'GitHub', icon: 'github' },
  { href: 'https://linkedin.com/in/agunggumelarsaputra', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'mailto:agumelarsaputra@gmail.com', label: 'Email', icon: 'email' },
];
---

<footer class="bg-bg-secondary border-t border-border py-8 mt-auto">
  <div class="container-main text-center">
    <p class="text-text-secondary text-sm">
      &copy; {new Date().getFullYear()} Agung Gumelar Saputra. All rights reserved.
    </p>
    
    <div class="flex justify-center gap-4 mt-4">
      {socialLinks.map((link) => (
        <a 
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-secondary hover:text-accent-primary transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
    
    <p class="text-text-secondary text-xs mt-4 opacity-60">
      Built with Astro & TailwindCSS • Hosted on VPS with Caddy
    </p>
  </div>
</footer>
```

- [ ] **Step 3: Commit**

---

### Task 4: Landing Page Components - Hero, About, Skills

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/About.astro`
- Create: `src/components/Skills.astro`

- [ ] **Step 1: Buat src/components/Hero.astro**

```astro
---
const name = "Agung Gumelar Saputra";
const title = "Rekayasa Perangkat Lunak | S2 Teknologi Pendidikan & Vokasi | EdTech Enthusiast | AI Explorer";
---

<section class="min-h-screen flex items-center justify-center pt-16">
  <div class="container-main text-center">
    <h1 class="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
      {name}
    </h1>
    
    <p class="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
      {title}
    </p>
    
    <a 
      href="/blog" 
      class="inline-block bg-accent-primary hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
    >
      Baca Blog
    </a>
  </div>
</section>

<style>
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
```

- [ ] **Step 2: Buat src/components/About.astro**

```astro
---

---

<section id="about" class="py-24 bg-bg-secondary">
  <div class="container-main">
    <h2 class="text-3xl font-semibold text-center mb-12">Tentang Saya</h2>
    
    <div class="grid md:grid-cols-2 gap-12 items-center">
      <div class="aspect-square max-w-sm mx-auto bg-bg-tertiary rounded-xl flex items-center justify-center">
        <span class="text-6xl">👨‍💻</span>
      </div>
      
      <div>
        <h3 class="text-xl font-semibold text-accent-primary mb-4">Hai, Saya Agung!</h3>
        <p class="text-text-secondary mb-4">
          Saya seorang praktisi di bidang Rekayasa Perangkat Lunak dengan ketertarikan mendalam pada teknologi pendidikan dan kecerdasan buatan.
        </p>
        <p class="text-text-secondary mb-4">
          Saat ini sedang menempuh studi S2 di bidang Teknologi Pendidikan & Vokasi, dengan fokus pada pengembangan solusi EdTech yang inovatif.
        </p>
        <p class="text-text-secondary">
          Percaya bahwa teknologi dapat mengubah cara kita belajar dan mengajar, membuat pendidikan lebih aksesibel dan efektif untuk semua.
        </p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Buat src/components/Skills.astro**

```astro
---
const skills = [
  {
    title: "🖥️ Software Development",
    description: "Rekayasa Perangkat Lunak, Web Development, Mobile Apps"
  },
  {
    title: "🤖 Artificial Intelligence",
    description: "Machine Learning, NLP, AI Applications"
  },
  {
    title: "📚 EdTech",
    description: "Educational Technology, Learning Management Systems"
  },
  {
    title: "🎓 Teknologi Pendidikan",
    description: "Instructional Design, Digital Learning"
  },
];
---

<section id="skills" class="py-24">
  <div class="container-main">
    <h2 class="text-3xl font-semibold text-center mb-12">Keahlian</h2>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {skills.map((skill) => (
        <div class="bg-bg-secondary p-6 rounded-xl border border-border hover:border-accent-primary transition-colors">
          <h3 class="text-lg font-semibold mb-3">{skill.title}</h3>
          <p class="text-text-secondary text-sm">{skill.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Commit**

---

### Task 5: Create Landing Page (index.astro)

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Buat src/pages/index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Navigation from '../components/Navigation.astro';
import Footer from '../components/Footer.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import Skills from '../components/Skills.astro';
---

<BaseLayout title="Home">
  <Navigation />
  <main>
    <Hero />
    <About />
    <Skills />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

---

### Task 6: Setup Blog Content System

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/hello-world.md`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Install MDX**

Run: `cd /var/www/agunggumelarsaputra.com && npm install @astrojs/mdx`

- [ ] **Step 2: Update astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [tailwind(), mdx()],
  site: 'https://agunggumelarsaputra.com',
});
```

- [ ] **Step 3: Buat src/content/config.ts**

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 4: Buat sample blog post**

```markdown
---
title: "Welcome to My Blog"
description: "First post on my personal blog"
pubDate: 2026-03-26
tags: ["personal", "introduction"]
---

# Hello World

Welcome to my personal blog! This is my first post.

## About This Blog

I'll be sharing my thoughts on:
- Software Development
- EdTech
- Artificial Intelligence
- Technology Education

Stay tuned for more updates!
```

- [ ] **Step 5: Commit**

---

### Task 7: Create Blog Index Page

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Buat src/pages/blog/index.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Navigation from '../../components/Navigation.astro';
import Footer from '../../components/Footer.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog'))
  .filter(post => !post.data.draft)
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

const allTags = [...new Set(posts.flatMap(post => post.data.tags))];
---

<BaseLayout title="Blog" description="Articles and tutorials">
  <Navigation />
  <main class="pt-24 pb-16">
    <div class="container-main">
      <h1 class="text-4xl font-bold mb-8">Blog</h1>
      
      <!-- Tags Filter -->
      <div class="flex flex-wrap gap-2 mb-8">
        <a href="/blog" class="px-3 py-1 bg-accent-primary text-white text-sm rounded-full">
          All
        </a>
        {allTags.map((tag) => (
          <a href={`/blog?tag=${tag}`} class="px-3 py-1 bg-bg-tertiary text-text-secondary text-sm rounded-full hover:bg-accent-primary hover:text-white transition-colors">
            {tag}
          </a>
        ))}
      </div>
      
      <!-- Blog Posts -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article class="bg-bg-secondary rounded-xl border border-border overflow-hidden hover:border-accent-primary transition-colors">
            <a href={`/blog/${post.slug}`}>
              <div class="p-6">
                <h2 class="text-xl font-semibold mb-2">{post.data.title}</h2>
                <p class="text-text-secondary text-sm mb-4">{post.data.description}</p>
                <div class="flex items-center justify-between">
                  <time class="text-text-secondary text-xs">
                    {post.data.pubDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <div class="flex gap-2">
                    {post.data.tags.slice(0, 2).map((tag) => (
                      <span class="text-xs px-2 py-1 bg-bg-tertiary text-text-secondary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>
    </div>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

---

### Task 8: Create Blog Post Layout & Page

**Files:**
- Create: `src/layouts/BlogPostLayout.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Buat src/layouts/BlogPostLayout.astro**

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import Navigation from '../components/Navigation.astro';
import Footer from '../components/Footer.astro';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
---

<BaseLayout title={post.data.title} description={post.data.description}>
  <Navigation />
  <main class="pt-24 pb-16">
    <article class="container-content">
      <!-- Header -->
      <header class="mb-12">
        <h1 class="text-4xl font-bold mb-4">{post.data.title}</h1>
        <div class="flex items-center gap-4 text-text-secondary text-sm">
          <time>
            {post.data.pubDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <div class="flex gap-2">
            {post.data.tags.map((tag) => (
              <span class="px-2 py-1 bg-bg-tertiary rounded text-xs">{tag}</span>
            ))}
          </div>
        </div>
      </header>
      
      <!-- Content -->
      <div class="prose prose-invert max-w-none">
        <slot />
      </div>
      
      <!-- Tags -->
      <div class="mt-12 pt-8 border-t border-border">
        <h3 class="text-sm font-semibold mb-4">Tags:</h3>
        <div class="flex flex-wrap gap-2">
          {post.data.tags.map((tag) => (
            <a href={`/blog?tag=${tag}`} class="px-3 py-1 bg-bg-tertiary text-text-secondary text-sm rounded-full hover:bg-accent-primary hover:text-white transition-colors">
              {tag}
            </a>
          ))}
        </div>
      </div>
    </article>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Buat src/pages/blog/[slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogPostLayout post={post}>
  <Content />
</BlogPostLayout>
```

- [ ] **Step 3: Install typography plugin**

Run: `npm install -D @tailwindcss/typography`

- [ ] **Step 4: Update tailwind.config.mjs**

Tambahkan ke plugins:
```javascript
plugins: [
  require('@tailwindcss/typography'),
],
```

- [ ] **Step 5: Commit**

---

### Task 9: Create CV Page

**Files:**
- Create: `src/pages/cv.astro`

- [ ] **Step 1: Buat src/pages/cv.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Navigation from '../components/Navigation.astro';
import Footer from '../components/Footer.astro';

const experience = [
  {
    title: "Software Developer",
    company: "PT Teknologi Maju",
    period: "2023 - Present",
    description: "Mengembangkan aplikasi web dan mobile untuk klien enterprise."
  },
  {
    title: "Web Developer",
    company: "Startup EduTech",
    period: "2021 - 2023",
    description: "Membangun platform pembelajaran online dengan Vue.js dan Node.js."
  },
];

const education = [
  {
    title: "S2 Teknologi Pendidikan & Vokasi",
    institution: "Universitas Negeri Jakarta",
    period: "2024 - Present",
  },
  {
    title: "S1 Rekayasa Perangkat Lunak",
    institution: "Institut Teknologi Bandung",
    period: "2019 - 2023",
  },
];

const skills = [
  "JavaScript/TypeScript", "React", "Vue.js", "Node.js",
  "Python", "Machine Learning", "PostgreSQL", "Git",
  "Docker", "AWS", "Figma"
];
---

<BaseLayout title="CV" description="Curriculum Vitae - Agung Gumelar Saputra">
  <Navigation />
  <main class="pt-24 pb-16">
    <div class="container-main">
      <h1 class="text-4xl font-bold mb-8">Curriculum Vitae</h1>
      
      <!-- Header -->
      <section class="mb-12">
        <div class="flex items-center gap-8">
          <div class="w-32 h-32 bg-bg-tertiary rounded-full flex items-center justify-center">
            <span class="text-4xl">👨‍💻</span>
          </div>
          <div>
            <h2 class="text-2xl font-semibold">Agung Gumelar Saputra</h2>
            <p class="text-text-secondary">Software Developer | EdTech Enthusiast</p>
            <div class="flex gap-4 mt-4">
              <a href="mailto:agumelarsaputra@gmail.com" class="text-accent-primary hover:underline">agumelarsaputra@gmail.com</a>
              <a href="https://github.com/agumelar" class="text-accent-primary hover:underline">GitHub</a>
              <a href="https://linkedin.com/in/agunggumelarsaputra" class="text-accent-primary hover:underline">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Experience -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold mb-6">Pengalaman Kerja</h3>
        <div class="space-y-6">
          {experience.map((exp) => (
            <div class="bg-bg-secondary p-6 rounded-xl border border-border">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold">{exp.title}</h4>
                <span class="text-text-secondary text-sm">{exp.period}</span>
              </div>
              <p class="text-accent-primary text-sm mb-2">{exp.company}</p>
              <p class="text-text-secondary">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <!-- Education -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold mb-6">Pendidikan</h3>
        <div class="space-y-6">
          {education.map((edu) => (
            <div class="bg-bg-secondary p-6 rounded-xl border border-border">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold">{edu.title}</h4>
                <span class="text-text-secondary text-sm">{edu.period}</span>
              </div>
              <p class="text-accent-primary">{edu.institution}</p>
            </div>
          ))}
        </div>
      </section>
      
      <!-- Skills -->
      <section>
        <h3 class="text-2xl font-semibold mb-6">Keahlian</h3>
        <div class="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <span class="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

---

### Task 10: Create Contact Page

**Files:**
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Buat src/pages/contact.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Navigation from '../components/Navigation.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout title="Contact" description="Hubungi Agung Gumelar Saputra">
  <Navigation />
  <main class="pt-24 pb-16">
    <div class="container-main">
      <h1 class="text-4xl font-bold mb-8 text-center">Hubungi Saya</h1>
      
      <div class="max-w-2xl mx-auto">
        <!-- Contact Form -->
        <form 
          class="bg-bg-secondary p-8 rounded-xl border border-border mb-12"
          name="contact"
          method="POST"
          data-netlify="true"
        >
          <div class="mb-6">
            <label for="name" class="block text-sm font-medium mb-2">Nama</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              class="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg focus:outline-none focus:border-accent-primary"
            />
          </div>
          
          <div class="mb-6">
            <label for="email" class="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              class="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg focus:outline-none focus:border-accent-primary"
            />
          </div>
          
          <div class="mb-6">
            <label for="message" class="block text-sm font-medium mb-2">Pesan</label>
            <textarea 
              id="message" 
              name="message" 
              rows="5" 
              required
              minlength="10"
              class="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg focus:outline-none focus:border-accent-primary resize-none"
            ></textarea>
          </div>
          
          <button 
            type="submit"
            class="w-full bg-accent-primary hover:bg-accent-hover text-white py-3 rounded-lg font-medium transition-colors"
          >
            Kirim Pesan
          </button>
        </form>
        
        <!-- Social Links -->
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-4">Atau hubungi melalui:</h3>
          <div class="flex justify-center gap-6">
            <a 
              href="https://github.com/agumelar" 
              target="_blank"
              rel="noopener noreferrer"
              class="text-text-secondary hover:text-accent-primary transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://linkedin.com/in/agunggumelarsaputra" 
              target="_blank"
              rel="noopener noreferrer"
              class="text-text-secondary hover:text-accent-primary transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="mailto:agumelarsaputra@gmail.com"
              class="text-text-secondary hover:text-accent-primary transition-colors"
            >
              Email
            </a>
          </div>
          
          <div class="mt-8 p-4 bg-bg-secondary rounded-lg border border-border">
            <p class="text-text-secondary text-sm">
              ⏰ Response time: typically within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Commit**

---

### Task 11: Setup Decap CMS (Admin Panel)

**Files:**
- Create: `src/pages/admin/index.html`
- Create: `public/admin/config.yml`
- Create: `public/admin/index.html`

- [ ] **Step 1: Buat folder dan file config**

Run: `mkdir -p /var/www/agunggumelarsaputra.com/public/admin`

- [ ] **Step 2: Buat public/admin/config.yml**

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/images"
public_folder: "/images"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Description", name: "description", widget: "text"}
      - {label: "Publish Date", name: "pubDate", widget: "datetime"}
      - {label: "Hero Image", name: "heroImage", widget: "string", required: false}
      - {label: "Tags", name: "tags", widget: "list", default: []}
      - {label: "Draft", name: "draft", widget: "boolean", default: false}
      - {label: "Body", name: "body", widget: "markdown"}
```

- [ ] **Step 3: Buat public/admin/index.html**

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <!-- Include the script that builds the page and powers Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 4: Setup Basic Auth untuk Admin**

Tambahkan ke Caddyfile:
```
# Admin routes - require password
@admin {
  path /admin
}

respond @admin "Unauthorized" 401 {
  WWW-Authenticate "Basic realm=Admin Area"
}

basicauth /admin/* {
  agumelar JDJhJDA1JGFhNjc5ZTY4NDQ1MTVmNjc5OWMwNjQ1YjM2YjcxNjk5ZDZmNjc5OWMwNjQ1YjM2YjcxNjk5ZDZmNjk=
}
```

Note: Password "4gung16" perlu di-hash dulu. Hash: `bcrypt($2a$10$`...

- [ ] **Step 5: Commit**

---

### Task 12: Setup Giscus Comments

**Files:**
- Modify: `src/layouts/BlogPostLayout.astro`

- [ ] **Step 1: Update BlogPostLayout.astro**

Tambahkan sebelum closing `</Footer>`:

```astro
<!-- Giscus Comments -->
<div class="mt-12 pt-8 border-t border-border">
  <script 
    src="https://giscus.app/client.js"
    data-repo="agumelar/agunggumelarsaputra.com"
    data-repo-id="R_kgDO..."
    data-category="Comments"
    data-category-id="DIC_kwDO..."
    data-mapping="pathname"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="bottom"
    data-theme="dark"
    data-lang="id"
    crossorigin="anonymous"
    async>
  </script>
</div>
```

Note: Perlu setup GitHub repo dulu untuk dapat repo-id dan category-id.

- [ ] **Step 2: Commit**

---

### Task 13: Build & Deploy

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Build project**

Run: `cd /var/www/agunggumelarsaputra.com && npm run build`

- [ ] **Step 2: Preview**

Run: `npm run preview`

- [ ] **Step 3: Deploy**

Copy hasil build ke root:
Run: `cp -r /var/www/agunggumelarsaputra.com/dist/* /var/www/agunggumelarsaputra.com/`

- [ ] **Step 4: Reload Caddy**

Run: `sudo caddy reload`

- [ ] **Step 5: Commit final**

---

## Execution

Plan complete. Choose execution approach:

1. **Subagent-Driven** - Fresh subagent per task
2. **Inline Execution** - Execute in this session

Which approach?
