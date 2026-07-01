import type { BaseFrontmatter } from '../base';

export type ResolvedAuthor = {
  name: string;
  url?: string;
  avatar?: string;
  sameAs?: string[];
};

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function getAuthorSchema(baseUrl: string, author: ResolvedAuthor) {
  return {
    '@type': 'Person' as const,
    '@id': `${baseUrl}/#author`,
    name: author.name,
    url: author.url ? joinUrl(baseUrl, author.url) : undefined,
    image: author.avatar,
    sameAs: author.sameAs,
  };
}

export function getImageSchema(fm: BaseFrontmatter) {
  if (!fm.image) return undefined;
  return {
    '@type': 'ImageObject' as const,
    url: fm.image.url,
    caption: fm.image.alt,
    width: fm.image.width,
    height: fm.image.height,
  };
}

export function getVideoSchema(fm: BaseFrontmatter) {
  if (!fm.video) return undefined;
  return {
    '@type': 'VideoObject' as const,
    name: fm.title,
    description: fm.description,
    thumbnailUrl: fm.video.thumbnail,
    uploadDate: fm.video.uploadDate || fm.datePublished,
    duration: fm.video.duration,
    embedUrl: fm.video.embedUrl,
    contentUrl: fm.video.url,
    transcript: fm.video.transcript,
  };
}

export function getFAQSchema(fm: BaseFrontmatter) {
  if (!fm.faqs || fm.faqs.length === 0) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage' as const,
    mainEntity: fm.faqs.map((faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(baseUrl: string, fm: BaseFrontmatter) {
  const items = [
    { position: 1, name: 'Home', item: baseUrl },
    {
      position: 2,
      name: fm.categories[0] || 'Blog',
      item: `${baseUrl}/category/${fm.categories[0] || 'blog'}`,
    },
    {
      position: 3,
      name: fm.title,
      item: `${baseUrl}/${fm.id}`,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem' as const,
      position: item.position,
      name: item.name,
      item: item.item,
    })),
  };
}

export function getWebPageSchema(baseUrl: string, fm: BaseFrontmatter) {
  return {
    '@type': 'WebPage' as const,
    '@id': `${baseUrl}/${fm.id}#webpage`,
    url: `${baseUrl}/${fm.id}`,
    name: fm.title,
    description: fm.description,
    datePublished: fm.datePublished,
    dateModified: fm.dateModified,
    isPartOf: {
      '@type': 'WebSite' as const,
      '@id': `${baseUrl}/#website`,
    },
  };
}

export function getOrganizationSchema(baseUrl: string) {
  return {
    '@type': 'Organization' as const,
    '@id': `${baseUrl}/#organization`,
    name: 'Vedify',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject' as const,
      url: `${baseUrl}/logo.png`,
    },
  };
}
