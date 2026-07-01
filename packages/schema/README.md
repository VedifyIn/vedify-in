# @vedify/schema

Canonical Zod schemas for all content frontmatter. Provides validation, type inference, and structured data generation for the Vedify knowledge hub.

---

## File Structure

```
src/
├── enums.ts              — ContentType, difficulty, twitterCard, diet, seoPriority, status, intent, topic enums
├── nested.ts             — Reusable sub-object schemas (image, video, faq, ingredient, etc.)
├── base.ts               — baseSchema — foundation fields EVERY page has
├── variants/             — Per-content-type schemas extending baseSchema
│   ├── simple.ts         — BlogPost, Essay, Opinion, ShortStory, Folktale, Gist, QuickNote, …
│   ├── tutorial-code.ts  — Tutorial, CodeSnippet
│   ├── recipe.ts         — Recipe
│   ├── book.ts           — Book, BookReview
│   ├── research.ts       — ResearchPaper, Patent
│   ├── podcast.ts        — PodcastEpisode
│   ├── quote.ts          — Quote
│   └── course.ts         — Course, CourseLesson
├── variants/index.ts     — Re-exports all variants
├── policy-enforcer.ts    — Soft warnings (missing image/AEO, content length, internal links, FAQ)
├── schema-library/       — JSON-LD structured data generation
│   ├── building-blocks.ts — ResolvedAuthor type, Author, Image, Video, FAQ, Breadcrumb, WebPage, Organization
│   ├── measurements.ts   — Nutrition, Rating schemas
│   ├── content-types.ts  — BlogPosting, TechArticle, Recipe, Book, Course, Podcast, etc.
│   └── index.ts          — SchemaLibrary class (assembles schemas by content type)
└── index.ts              — Discriminated union + superRefine + helpers + re-exports everything
```

## Schema Hierarchy

```
z (re-export from zod)
│
├── Enums ────────────────────────────────── Leaf scalars
│   ├── contentTypeSchema        ── 22 content types
│   ├── difficultySchema         ── Beginner | Intermediate | Advanced
│   ├── twitterCardSchema        ── summary | summary_large_image | app | player
│   ├── dietSchema               ── DiabeticDiet | GlutenFreeDiet | HalalDiet | …
│   ├── seoPrioritySchema        ── low | medium | high
│   ├── statusSchema             ── draft | published | archived
│   ├── intentSchema             ── understand | implement | debug | reference
│   └── topicSchema              ── dsa | lld | hld | os | java | flutter | python
│
├── Nested Object Schemas ────────────────── Embedded into baseSchema or variants
│   ├── imageSchema              ── url, alt, width?, height?
│   ├── videoSchema              ── url, thumbnail, duration?, transcript?, …
│   ├── faqSchema                ── question, answer
│   ├── ingredientSchema         ── name, amount, preparation?
│   ├── instructionSchema        ── text, image?
│   ├── nutritionSchema          ── calories?, protein?, carbs?, fat?
│   ├── bookMetadataSchema       ── title, author, isbn?, publisher?, …
│   ├── ratingSchema             ── value (0-5), bestRating, worstRating
│   ├── mediaObjectSchema        ── type (audio|video), url, duration?, transcript?
│   ├── quoteObjectSchema        ── text, attributedTo {name, url?, sameAs?}, context?
│   └── providerSchema           ── name, url?
│
├── baseSchema ───────────────────────────── Foundation — every page
│   │
│   ├── Embeds:
│   │   ├── author: string   ── identifier key (e.g. "vaidic"), resolved at app layer
│   │   ├── imageSchema?     ── as .image
│   │   ├── videoSchema?     ── as .video
│   │   └── faqSchema[]?     ── as .faqs
│   │
│   └── Own fields:
│       id, title, description, datePublished, dateModified,
│       author: string, status, intent?, topic?,
│       tags[], categories[], series?, seriesPart?,
│       seriesTitle?, totalParts?, sequentialOnly, prerequisites[],
│       readingTime?, difficulty?, totalTime?, layout?,
│       canonical?, noIndex,
│       twitterCard?, twitterSite?, twitterCreator?,
│       socialImage?, socialTitle?, socialDescription?,
│       aeoDirectAnswer?,
│       seoPriority, evergreen, featured
│
├── Type-specific Schemas ────────────────── Each extends baseSchema + adds a `type` discriminator
│   │
│   ├── simpleContentSchema ────────── (private, 11 types)
│   │   └── type: 'BlogPost' | 'Essay' | 'Opinion' | 'ShortStory'
│   │            | 'Folktale' | 'Gist' | 'QuickNote' | 'SeriesOverview'
│   │            | 'Devotional' | 'LegalPage' | 'AboutMe'
│   │   └── No extra fields
│   │
│   ├── tutorialCodeSchema ─────────── type: 'Tutorial' | 'CodeSnippet'
│   │   └── Extra: programmingLanguage[], codeRepository?, dependencies[], codeSnippet?
│   │
│   ├── recipeSchema ───────────────── type: 'Recipe'
│   │   ├── Embeds: ingredientSchema[], instructionSchema[], nutritionSchema?
│   │   └── Extra: cookingMethod?, prepTime?, cookTime?, yields?,
│   │              recipeCategory?, recipeCuisine?, suitableForDiet[]?
│   │
│   ├── bookSchema ─────────────────── type: 'Book' | 'BookReview'
│   │   ├── Embeds: bookMetadataSchema?, ratingSchema?
│   │   └── Extra: reviewAspect[]?, reviewBody?
│   │
│   ├── researchSchema ─────────────── type: 'ResearchPaper' | 'Patent'
│   │   └── Extra: citation?, journal?, doi?, arxivId?,
│   │              patentNumber?, applicant?, issueDate?
│   │
│   ├── podcastSchema ──────────────── type: 'PodcastEpisode'
│   │   ├── Embeds: mediaObjectSchema?
│   │   └── Extra: episodeNumber?, seasonNumber?, podcastSeries?
│   │
│   ├── quoteSchema ────────────────── type: 'Quote'
│   │   └── Embeds: quoteObjectSchema?
│   │
│   └── courseSchema ───────────────── type: 'Course' | 'CourseLesson'
│       ├── Embeds: providerSchema?
│       └── Extra: educationalLevel?, timeRequired?,
│                  numberOfLessons?, courseCode?
│
├── contentSchema ────────────────────────── Discriminated union on `type`
│   │
│   └── Members (8):
│       ├── simpleContentSchema (11 types)
│       ├── tutorialCodeSchema  (2 types)
│       ├── recipeSchema        (1 type)
│       ├── bookSchema          (2 types)
│       ├── researchSchema      (2 types)
│       ├── podcastSchema       (1 type)
│       ├── quoteSchema         (1 type)
│       └── courseSchema        (2 types)
│
└── Helper Functions ─────────────────────── Runtime utilities
    ├── validateFrontmatter(data: unknown): ContentFrontmatter
    ├── hasVideo(content):            type guard — narrows to { video: Video }
    ├── hasAeoDirectAnswer(content):  boolean check
    ├── isRecipe(content):           type guard — narrows to { type: 'Recipe' }
    └── enforcePolicy(fm, body?):    PolicyResult — soft warnings (image, AEO, length, links)

├── Super Refine Rules ────────────────────── Cross-field validation on contentSchema
│   ├── seriesPart <= totalParts    ── Error when seriesPart exceeds totalParts
│   ├── series → requires seriesPart ── Error when series is set but seriesPart missing
│   ├── tags → requires topic       ── Error when tags are set but topic missing
│   └── Course/CourseLesson         ── Error when difficulty is missing
```

---

## Relationship Summary

| Schema                | Derives From                      | Adds                                                                   |
| --------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `baseSchema`          | —                                 | Core fields + `author: string` + embeds `image`, `video`, `faqs`       |
| `simpleContentSchema` | `baseSchema.extend()`             | `type` discriminator (11 literals)                                     |
| `tutorialCodeSchema`  | `baseSchema.extend()`             | `type` + code-specific fields                                          |
| `recipeSchema`        | `baseSchema.extend()`             | `type: 'Recipe'` + embeds `ingredient[]`, `instruction[]`, `nutrition` |
| `bookSchema`          | `baseSchema.extend()`             | `type` + embeds `bookMetadata`, `rating`                               |
| `researchSchema`      | `baseSchema.extend()`             | `type` + research/patent fields                                        |
| `podcastSchema`       | `baseSchema.extend()`             | `type: 'PodcastEpisode'` + embeds `mediaObject`                        |
| `quoteSchema`         | `baseSchema.extend()`             | `type: 'Quote'` + embeds `quoteObject`                                 |
| `courseSchema`        | `baseSchema.extend()`             | `type` + embeds `provider`                                             |
| `contentSchema`       | `z.discriminatedUnion()` of all 8 | Single union type — pick a variant by `type`                           |

---

## JSON-LD Generation

The `SchemaLibrary` class in `src/schema-library/` produces structured data from validated frontmatter.
It requires a resolved author object (looked up from `authors.yaml` in the app layer):

```ts
import { SchemaLibrary } from '@vedify/schema';
import type { ResolvedAuthor } from '@vedify/schema';

const lib = new SchemaLibrary('https://vedify.in', frontmatter, resolvedAuthor);
const schemas = lib.getAll();
// → content schema + breadcrumb + organization + optional FAQ + optional video
```

The `ResolvedAuthor` type (exported from `@vedify/schema`) matches the author definitions:

| Field     | Type       |
| --------- | ---------- |
| `name`    | `string`   |
| `url?`    | `string`   |
| `avatar?` | `string`   |
| `sameAs?` | `string[]` |

This object is passed to `getAuthorSchema()` to build the `Person` JSON-LD block:

```json
{
  "@type": "Person",
  "@id": "https://vedify.in/#author",
  "name": "Vaidic Joshi",
  "url": "https://vedify.in/about-me",
  "image": "/images/avatar.jpg",
  "sameAs": ["https://twitter.com/vaidicjoshi"]
}
```

### Building blocks composed per content type

| Block                   | Types That Use It        |
| ----------------------- | ------------------------ |
| `getAuthorSchema`       | EVERY schema             |
| `getImageSchema`        | EVERY schema with images |
| `getVideoSchema`        | Blog, Tutorial, Course   |
| `getFAQSchema`          | Any page with FAQs       |
| `getBreadcrumbSchema`   | EVERY page               |
| `getWebPageSchema`      | EVERY content schema     |
| `getOrganizationSchema` | EVERY page (publisher)   |
| `getNutritionSchema`    | Recipe                   |
| `getRatingSchema`       | Book, Review, Recipe     |

---

## Policy Enforcer

The `PolicyEnforcer` in `policy-enforcer.ts` produces **soft warnings** (non-fatal) that Zod can't express — contextual quality checks:

```ts
import { enforcePolicy } from '@vedify/schema';

const fm = contentSchema.parse(frontmatterData);
const result = enforcePolicy(fm, bodyContent);
// result.warnings — array of { field: string, message: string }
```

### Checks performed

| Check                   | Condition                                                                | Severity   |
| ----------------------- | ------------------------------------------------------------------------ | ---------- |
| Missing hero image      | `image` not set                                                          | ⚠️ Warning |
| Missing aeoDirectAnswer | `type` is BlogPost/Tutorial/Essay/Recipe/Course and no `aeoDirectAnswer` | ⚠️ Warning |
| Content too short       | Body word count below per-type minimum                                   | ⚠️ Warning |
| Content too long        | Body word count exceeds per-type maximum                                 | ⚠️ Warning |
| No internal links       | Body has no `](/path)` matches                                           | ⚠️ Warning |
| Missing FAQ             | `type` is BlogPost/Tutorial/Essay/Recipe with body but no `faqs`         | ⚠️ Warning |

### Per-type content length rules

| Type        | Min words | Max words |
| ----------- | --------- | --------- |
| Tutorial    | 1,500     | 10,000    |
| CodeSnippet | 100       | 1,500     |
| BlogPost    | 800       | 5,000     |
| Essay       | 1,000     | 6,000     |
| Gist        | 100       | 500       |
| QuickNote   | 50        | 500       |
| Recipe      | 400       | 2,000     |
| Quote       | 50        | 500       |
| Default     | 300       | 3,000     |

### Cross-field rules (Zod superRefine — errors, not warnings)

These are enforced at parse time by `contentSchema.superRefine` and will **throw** on invalid data:

| Rule                                          | Error message                                        |
| --------------------------------------------- | ---------------------------------------------------- |
| `seriesPart` must not exceed `totalParts`     | `seriesPart must not exceed totalParts`              |
| `series` requires `seriesPart`                | `seriesPart is required when series is set`          |
| `tags` require `topic`                        | `topic is required when tags are set`                |
| `difficulty` required for Course/CourseLesson | `difficulty is required for Course and CourseLesson` |

### Exports

```ts
import {
  contentSchema,
  validateFrontmatter,
  enforcePolicy,
  SchemaLibrary,
  // types
  type ContentFrontmatter,
  type PolicyWarning,
  type PolicyResult,
  type ResolvedAuthor,
} from '@vedify/schema';
```
