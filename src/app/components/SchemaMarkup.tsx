'use client';

export default function SchemaMarkup() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Found Fonts Foundry",
    "description": "A growing collection of typography discovered on the street, in the wild and everywhere in between.",
    "url": "https://foundfontfoundry.org/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://foundfontfoundry.org/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "author": {
      "@type": "Person",
      "name": "Benjamin Ikoma",
      "url": "http://benjaminikoma.be/"
    },
    "image": "https://foundfontfoundry.org/og-image.svg",
    "inLanguage": "en-US"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
} 