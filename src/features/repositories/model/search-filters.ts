export type KeywordFilter = {
  label: string;
  value: string;
  queryTerms: readonly string[];
};

export const LANGUAGE_FILTERS = [
  "TypeScript",
  "JavaScript",
  "Java",
  "Python",
  "Go",
  "Ruby",
  "PHP",
  "Rust",
  "Swift",
  "Kotlin",
  "C#",
  "C++",
  "Dart",
] as const;

export const FRAMEWORK_FILTERS: readonly KeywordFilter[] = [
  { label: "React", value: "React", queryTerms: ["react", "topic:react"] },
  {
    label: "Next.js",
    value: "Next.js",
    queryTerms: ["nextjs", "topic:nextjs"],
  },
  { label: "Vue", value: "Vue", queryTerms: ["vue", "topic:vue"] },
  {
    label: "Nuxt.js",
    value: "Nuxt.js",
    queryTerms: ["nuxtjs", "topic:nuxtjs"],
  },
  {
    label: "Angular",
    value: "Angular",
    queryTerms: ["angular", "topic:angular"],
  },
  {
    label: "Express",
    value: "Express",
    queryTerms: ["express", "topic:express"],
  },
  {
    label: "NestJS",
    value: "NestJS",
    queryTerms: ["nestjs", "topic:nestjs"],
  },
  {
    label: "Spring Boot",
    value: "Spring Boot",
    queryTerms: ['"spring boot"', "topic:spring-boot"],
  },
  {
    label: "Django",
    value: "Django",
    queryTerms: ["django", "topic:django"],
  },
  {
    label: "Ruby on Rails",
    value: "Ruby on Rails",
    queryTerms: ['"ruby on rails"', "topic:rails"],
  },
  {
    label: "Laravel",
    value: "Laravel",
    queryTerms: ["laravel", "topic:laravel"],
  },
] as const;

export const CLOUD_FILTERS: readonly KeywordFilter[] = [
  { label: "AWS", value: "AWS", queryTerms: ["aws", "topic:aws"] },
  {
    label: "Google Cloud",
    value: "Google Cloud",
    queryTerms: ['"google cloud"', "gcp", "topic:google-cloud"],
  },
  { label: "Azure", value: "Azure", queryTerms: ["azure", "topic:azure"] },
  {
    label: "Docker",
    value: "Docker",
    queryTerms: ["docker", "topic:docker"],
  },
  {
    label: "Kubernetes",
    value: "Kubernetes",
    queryTerms: ["kubernetes", "k8s", "topic:kubernetes"],
  },
  {
    label: "Terraform",
    value: "Terraform",
    queryTerms: ["terraform", "topic:terraform"],
  },
  {
    label: "Firebase",
    value: "Firebase",
    queryTerms: ["firebase", "topic:firebase"],
  },
  {
    label: "Vercel",
    value: "Vercel",
    queryTerms: ["vercel", "topic:vercel"],
  },
] as const;

export const LOW_ISSUES_MAX = 10;
export const RECENTLY_UPDATED_DAYS = 30;
