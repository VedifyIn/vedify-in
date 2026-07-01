import type { BaseFrontmatter } from '../base';
import type { ResolvedAuthor } from './building-blocks';
import type { BookMetadata } from '../nested';
import type { TutorialCodeFrontmatter } from '../variants/tutorial-code';
import type { RecipeFrontmatter } from '../variants/recipe';
import type { BookFrontmatter } from '../variants/book';
import type { PodcastFrontmatter } from '../variants/podcast';
import type { ResearchFrontmatter } from '../variants/research';
import type { QuoteFrontmatter } from '../variants/quote';
import {
  getAuthorSchema,
  getImageSchema,
  getWebPageSchema,
  getOrganizationSchema,
} from './building-blocks';
import { getNutritionSchema, getRatingSchema } from './measurements';

// Shared helper — avoids duplicating the Book object shape in two functions
function buildBookItem(book: BookMetadata, image?: ReturnType<typeof getImageSchema>) {
  return {
    '@type': 'Book' as const,
    name: book.title,
    author: { '@type': 'Person' as const, name: book.author },
    isbn: book.isbn,
    publisher: book.publisher,
    numberOfPages: book.pages,
    genre: book.genre,
    datePublished: book.publicationDate,
    image,
  };
}

export function getBlogPostingSchema(baseUrl: string, fm: BaseFrontmatter, author: ResolvedAuthor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting' as const,
    headline: fm.title,
    description: fm.description,
    datePublished: fm.datePublished,
    dateModified: fm.dateModified,
    author: getAuthorSchema(baseUrl, author),
    publisher: getOrganizationSchema(baseUrl),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    keywords: fm.tags.join(', '),
    articleSection: fm.categories[0],
  };
}

export function getTechArticleSchema(
  baseUrl: string,
  fm: TutorialCodeFrontmatter,
  author: ResolvedAuthor,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle' as const,
    headline: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    publisher: getOrganizationSchema(baseUrl),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    about: fm.programmingLanguage
      ? {
          '@type': 'SoftwareApplication' as const,
          name: fm.title,
          programmingLanguage: fm.programmingLanguage,
        }
      : undefined,
    codeRepository: fm.codeRepository,
    dependencies: fm.dependencies,
    hasPart: fm.codeSnippet
      ? {
          '@type': 'SoftwareSourceCode' as const,
          code: fm.codeSnippet,
          programmingLanguage: fm.programmingLanguage?.[0],
        }
      : undefined,
  };
}

export function getRecipeSchema(baseUrl: string, fm: RecipeFrontmatter, author: ResolvedAuthor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe' as const,
    name: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    prepTime: fm.prepTime,
    cookTime: fm.cookTime,
    totalTime: fm.totalTime,
    recipeYield: fm.yields,
    recipeCategory: fm.recipeCategory,
    recipeCuisine: fm.recipeCuisine,
    cookingMethod: fm.cookingMethod,
    recipeIngredient: fm.ingredients?.map(
      (ing) => `${ing.amount} ${ing.name}${ing.preparation ? `, ${ing.preparation}` : ''}`,
    ),
    recipeInstructions: fm.instructions?.map((step, i) => ({
      '@type': 'HowToStep' as const,
      position: i + 1,
      text: step.text,
      image: step.image,
    })),
    nutrition: getNutritionSchema(fm),
    suitableForDiet: fm.suitableForDiet?.map((d) => ({ '@type': d as string })),
  };
}

export function getBookSchema(_baseUrl: string, fm: BookFrontmatter, _author: ResolvedAuthor) {
  if (!fm.book) return undefined;
  return {
    '@context': 'https://schema.org',
    ...buildBookItem(fm.book, getImageSchema(fm)),
  };
}

export function getReviewSchema(baseUrl: string, fm: BookFrontmatter, author: ResolvedAuthor) {
  if (!fm.book) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Review' as const,
    itemReviewed: buildBookItem(fm.book),
    reviewRating: getRatingSchema(fm),
    reviewBody: fm.reviewBody,
    author: getAuthorSchema(baseUrl, author),
  };
}

export function getCourseSchema(baseUrl: string, fm: BaseFrontmatter, author: ResolvedAuthor) {
  const extra = fm as BaseFrontmatter & {
    educationalLevel?: string;
    timeRequired?: string;
    numberOfLessons?: number;
    provider?: { name: string; url?: string };
    courseCode?: string;
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Course' as const,
    name: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    provider: extra.provider
      ? {
          '@type': 'Organization' as const,
          name: extra.provider.name,
          url: extra.provider.url,
        }
      : undefined,
    educationalLevel: extra.educationalLevel,
    timeRequired: extra.timeRequired,
    numberOfLessons: extra.numberOfLessons,
    courseCode: extra.courseCode,
    hasCourseInstance: {
      '@type': 'CourseInstance' as const,
      courseMode: 'Online',
      url: `${baseUrl}/${fm.id}`,
    },
  };
}

export function getPodcastEpisodeSchema(
  baseUrl: string,
  fm: PodcastFrontmatter,
  author: ResolvedAuthor,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode' as const,
    name: fm.title,
    url: `${baseUrl}/${fm.id}`,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    audio: fm.media
      ? {
          '@type': 'AudioObject' as const,
          contentUrl: fm.media.url,
          duration: fm.media.duration,
          transcript: fm.media.transcript,
        }
      : undefined,
    episodeNumber: fm.episodeNumber,
    seasonNumber: fm.seasonNumber,
    partOfSeries: fm.podcastSeries
      ? {
          '@type': 'PodcastSeries' as const,
          name: fm.podcastSeries,
        }
      : undefined,
  };
}

export function getScholarlyArticleSchema(
  baseUrl: string,
  fm: ResearchFrontmatter,
  author: ResolvedAuthor,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle' as const,
    name: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    citation: fm.citation,
    journal: fm.journal,
    doi: fm.doi,
    sameAs: fm.arxivId ? `https://arxiv.org/abs/${fm.arxivId}` : undefined,
  };
}

export function getQuoteSchema(_baseUrl: string, fm: QuoteFrontmatter, _author: ResolvedAuthor) {
  if (!fm.quote) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Quote' as const,
    text: fm.quote.text,
    author: {
      '@type': 'Person' as const,
      name: fm.quote.attributedTo.name,
      url: fm.quote.attributedTo.url,
      sameAs: fm.quote.attributedTo.sameAs,
    },
    about: fm.quote.context,
  };
}
