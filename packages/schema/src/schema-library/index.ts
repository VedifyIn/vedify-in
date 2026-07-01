import type { ContentFrontmatter } from '../index';
import type { ResolvedAuthor } from './building-blocks';
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getVideoSchema,
  getOrganizationSchema,
} from './building-blocks';
import {
  getBlogPostingSchema,
  getTechArticleSchema,
  getRecipeSchema,
  getBookSchema,
  getReviewSchema,
  getCourseSchema,
  getPodcastEpisodeSchema,
  getScholarlyArticleSchema,
  getQuoteSchema,
} from './content-types';

export type { Image, Video, Faq } from '../nested';
export type { ResolvedAuthor } from './building-blocks';

export class SchemaLibrary {
  private baseUrl: string;
  private fm: ContentFrontmatter;
  private author: ResolvedAuthor;

  constructor(baseUrl: string, frontmatter: ContentFrontmatter, author: ResolvedAuthor) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.fm = frontmatter;
    this.author = author;
  }

  getAll(): Record<string, unknown>[] {
    const schemas: Record<string, unknown>[] = [];

    const contentSchema = this.getContentSchema();
    if (contentSchema) schemas.push(contentSchema);

    const breadcrumb = getBreadcrumbSchema(this.baseUrl, this.fm);
    schemas.push(breadcrumb);

    const organization = getOrganizationSchema(this.baseUrl);
    schemas.push(organization);

    const faq = getFAQSchema(this.fm);
    if (faq) schemas.push(faq);

    const video = getVideoSchema(this.fm);
    if (video) schemas.push(video);

    return schemas;
  }

  private getContentSchema(): Record<string, unknown> | undefined {
    const { baseUrl, fm, author } = this;

    switch (fm.type) {
      case 'BlogPost':
      case 'Essay':
      case 'Opinion':
      case 'Devotional':
      case 'ShortStory':
      case 'Folktale':
      case 'SeriesOverview':
      case 'Gist':
      case 'QuickNote':
      case 'LegalPage':
      case 'AboutMe':
        return getBlogPostingSchema(baseUrl, fm, author);

      case 'Tutorial':
      case 'CodeSnippet':
        return getTechArticleSchema(baseUrl, fm, author);

      case 'Recipe':
        return getRecipeSchema(baseUrl, fm, author);

      case 'Book':
        return getBookSchema(baseUrl, fm, author);

      case 'BookReview':
        return getReviewSchema(baseUrl, fm, author);

      case 'Course':
      case 'CourseLesson':
        return getCourseSchema(baseUrl, fm, author);

      case 'PodcastEpisode':
        return getPodcastEpisodeSchema(baseUrl, fm, author);

      case 'ResearchPaper':
      case 'Patent':
        return getScholarlyArticleSchema(baseUrl, fm, author);

      case 'Quote':
        return getQuoteSchema(baseUrl, fm, author);

      default: {
        // TypeScript exhaustiveness check — if a new type is added to the enum
        // without a case here, this line will produce a compile error.
        const _exhaustive: never = fm;
        return getBlogPostingSchema(baseUrl, _exhaustive, author);
      }
    }
  }
}
