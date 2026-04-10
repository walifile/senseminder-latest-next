export const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact SensePC",
  url: "https://sensepc.com/contact",
  mainEntity: {
    "@type": "Organization",
    name: "SensePC",
    url: "https://sensepc.com",
    email: "contact@sensepc.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1372 Peachtree",
      addressLocality: "Atlanta",
      addressRegion: "GA",
      postalCode: "30309",
      addressCountry: "US",
    },
  },
};
