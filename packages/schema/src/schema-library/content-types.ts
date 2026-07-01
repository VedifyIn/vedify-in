import type { BaseFrontmatter } from '../base';
import type { ResolvedAuthor } from './building-blocks';
import {
  getAuthorSchema,
  getImageSchema,
  getWebPageSchema,
  getOrganizationSchema,
} from './building-blocks';
import { getNutritionSchema, getRatingSchema } from './measurements';

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

export function getTechArticleSchema(baseUrl: string, fm: BaseFrontmatter, author: ResolvedAuthor) {
  const extra = fm as BaseFrontmatter & {
    programmingLanguage?: string[];
    codeRepository?: string;
    dependencies?: string[];
    codeSnippet?: string;
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle' as const,
    headline: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    publisher: getOrganizationSchema(baseUrl),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    about: extra.programmingLanguage
      ? {
          '@type': 'SoftwareApplication' as const,
          name: fm.title,
          programmingLanguage: extra.programmingLanguage,
        }
      : undefined,
    codeRepository: extra.codeRepository,
    dependencies: extra.dependencies,
    hasPart: extra.codeSnippet
      ? {
          '@type': 'SoftwareSourceCode' as const,
          code: extra.codeSnippet,
          programmingLanguage: extra.programmingLanguage?.[0],
        }
      : undefined,
  };
}

export function getRecipeSchema(baseUrl: string, fm: BaseFrontmatter, author: ResolvedAuthor) {
  const extra = fm as BaseFrontmatter & {
    ingredients?: Array<{ name: string; amount: string; preparation?: string }>;
    instructions?: Array<{ text: string; image?: string }>;
    cookingMethod?: string;
    prepTime?: string;
    cookTime?: string;
    yields?: string;
    recipeCategory?: string;
    recipeCuisine?: string;
    suitableForDiet?: string[];
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe' as const,
    name: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    prepTime: extra.prepTime,
    cookTime: extra.cookTime,
    totalTime: fm.totalTime,
    recipeYield: extra.yields,
    recipeCategory: extra.recipeCategory,
    recipeCuisine: extra.recipeCuisine,
    cookingMethod: extra.cookingMethod,
    recipeIngredient: extra.ingredients?.map(
      (ing) => `${ing.amount} ${ing.name}${ing.preparation ? `, ${ing.preparation}` : ''}`,
    ),
    recipeInstructions: extra.instructions?.map((step, i) => ({
      '@type': 'HowToStep' as const,
      position: i + 1,
      text: step.text,
      image: step.image,
    })),
    nutrition: getNutritionSchema(fm),
    suitableForDiet: extra.suitableForDiet?.map((d) => ({ '@type': d as string })),
  };
}

export function getBookSchema(_baseUrl: string, fm: BaseFrontmatter, _author: ResolvedAuthor) {
  const extra = fm as BaseFrontmatter & {
    book?: {
      title: string;
      author: string;
      isbn?: string;
      publisher?: string;
      pages?: number;
      genre?: string[];
      publicationDate?: string;
    };
    rating?: { value: number; bestRating?: number; worstRating?: number };
    reviewBody?: string;
  };
  if (!extra.book) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Book' as const,
    name: extra.book.title,
    author: { '@type': 'Person' as const, name: extra.book.author },
    isbn: extra.book.isbn,
    publisher: extra.book.publisher,
    numberOfPages: extra.book.pages,
    genre: extra.book.genre,
    datePublished: extra.book.publicationDate,
    image: getImageSchema(fm),
  };
}

export function getReviewSchema(baseUrl: string, fm: BaseFrontmatter, author: ResolvedAuthor) {
  const extra = fm as BaseFrontmatter & {
    book?: {
      title: string;
      author: string;
      isbn?: string;
      publisher?: string;
      pages?: number;
      genre?: string[];
      publicationDate?: string;
    };
    rating?: { value: number; bestRating?: number; worstRating?: number };
    reviewAspect?: string[];
    reviewBody?: string;
  };
  if (!extra.book) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Review' as const,
    itemReviewed: {
      '@type': 'Book' as const,
      name: extra.book.title,
      author: { '@type': 'Person' as const, name: extra.book.author },
      isbn: extra.book.isbn,
      publisher: extra.book.publisher,
      numberOfPages: extra.book.pages,
      genre: extra.book.genre,
      datePublished: extra.book.publicationDate,
    },
    reviewRating: getRatingSchema(fm),
    reviewBody: extra.reviewBody,
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
  fm: BaseFrontmatter,
  author: ResolvedAuthor,
) {
  const extra = fm as BaseFrontmatter & {
    media?: { type: string; url: string; duration?: string; transcript?: string };
    episodeNumber?: number;
    seasonNumber?: number;
    podcastSeries?: string;
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode' as const,
    name: fm.title,
    url: `${baseUrl}/${fm.id}`,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    audio: extra.media
      ? {
          '@type': 'AudioObject' as const,
          contentUrl: extra.media.url,
          duration: extra.media.duration,
          transcript: extra.media.transcript,
        }
      : undefined,
    episodeNumber: extra.episodeNumber,
    seasonNumber: extra.seasonNumber,
    partOfSeries: extra.podcastSeries
      ? {
          '@type': 'PodcastSeries' as const,
          name: extra.podcastSeries,
        }
      : undefined,
  };
}

export function getScholarlyArticleSchema(
  baseUrl: string,
  fm: BaseFrontmatter,
  author: ResolvedAuthor,
) {
  const extra = fm as BaseFrontmatter & {
    citation?: string;
    journal?: string;
    doi?: string;
    arxivId?: string;
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle' as const,
    name: fm.title,
    description: fm.description,
    author: getAuthorSchema(baseUrl, author),
    image: getImageSchema(fm),
    mainEntityOfPage: getWebPageSchema(baseUrl, fm),
    citation: extra.citation,
    journal: extra.journal,
    doi: extra.doi,
    sameAs: extra.arxivId ? `https://arxiv.org/abs/${extra.arxivId}` : undefined,
  };
}

export function getQuoteSchema(_baseUrl: string, fm: BaseFrontmatter, _author: ResolvedAuthor) {
  const extra = fm as BaseFrontmatter & {
    quote?: {
      text: string;
      attributedTo: { name: string; url?: string; sameAs?: string[] };
      context?: string;
    };
  };
  if (!extra.quote) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Quote' as const,
    text: extra.quote.text,
    author: {
      '@type': 'Person' as const,
      name: extra.quote.attributedTo.name,
      url: extra.quote.attributedTo.url,
      sameAs: extra.quote.attributedTo.sameAs,
    },
    about: extra.quote.context,
  };
}
