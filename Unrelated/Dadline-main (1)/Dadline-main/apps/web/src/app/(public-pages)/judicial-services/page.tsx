import type { Metadata } from "next"
import JudicialServicesCta from "./_components/JudicialServicesCta"
import JudicialServicesFaq from "./_components/JudicialServicesFaq"
import JudicialServicesGrid from "./_components/JudicialServicesGrid"
import JudicialServicesHero from "./_components/JudicialServicesHero"
import JudicialServicesProcess from "./_components/JudicialServicesProcess"
import JudicialServicesSeoContent from "./_components/JudicialServicesSeoContent"
import JudicialServicesTrust from "./_components/JudicialServicesTrust"
import { judicialServices } from "./_data/judicial-services"

const SITE_URL = "https://dadline.net"
const PAGE_PATH = "/judicial-services"
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PAGE_TITLE = "خدمات قضایی آنلاین و رسمی - تحت نظر قوه قضاییه"
const PAGE_DESCRIPTION =
  "ثبت آنلاین دادخواست، لایحه، شکواییه و اظهارنامه در دادلاین؛ خدمات الکترونیک قضایی رسمی، امن و قابل پیگیری با پشتیبانی تخصصی و بدون مراجعه غیرضروری."

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | دادلاین`,
  description: PAGE_DESCRIPTION,
  keywords: [
    "خدمات قضایی آنلاین",
    "خدمات الکترونیک قضایی",
    "خدمات غیرحضوری قوه قضاییه",
    "دفتر خدمات قضایی آنلاین",
    "ثبت آنلاین دادخواست",
    "ثبت دادخواست اینترنتی",
    "ثبت لایحه قضایی",
    "ثبت لایحه آنلاین",
    "ثبت شکواییه آنلاین",
    "ثبت شکایت اینترنتی",
    "ثبت اظهارنامه آنلاین",
    "ثبت اظهارنامه قضایی",
    "ثبت اوراق قضایی",
    "پیگیری درخواست قضایی",
    "خدمات قضایی غیرحضوری",
    "خدمات قضایی نیمه حضوری",
    "سامانه خدمات قضایی",
    "ثبت رسمی اوراق قضایی",
    "دادلاین",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: PAGE_URL,
    siteName: "دادلاین",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "خدمات حقوقی و قضایی",
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      inLanguage: "fa-IR",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "دادلاین",
      },
      breadcrumb: {
        "@id": `${PAGE_URL}#breadcrumb`,
      },
      mainEntity: {
        "@id": `${PAGE_URL}#service`,
      },
    },
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "خدمات الکترونیک قضایی دادلاین",
      serviceType: "خدمات قضایی آنلاین و غیرحضوری",
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      areaServed: {
        "@type": "Country",
        name: "ایران",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: PAGE_URL,
        availableLanguage: {
          "@type": "Language",
          name: "Persian",
          alternateName: "fa",
        },
      },
      provider: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "دادلاین",
        url: SITE_URL,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "خدمات قابل ثبت قضایی",
        itemListElement: judicialServices.map((service, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Service",
            name: `ثبت ${service.title}`,
            description: service.description,
            url: `${SITE_URL}/pishkhan/judicial-services/${service.slug}`,
          },
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "دادلاین",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "خدمات قضایی",
          item: PAGE_URL,
        },
      ],
    },
  ],
}

const JudicialServicesPage = () => (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
    <JudicialServicesHero />
    <JudicialServicesGrid />
    <JudicialServicesTrust />
    <JudicialServicesProcess />
    <JudicialServicesSeoContent />
    <JudicialServicesFaq />
    <JudicialServicesCta />
  </>
)

export default JudicialServicesPage
