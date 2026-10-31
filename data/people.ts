import type { RecommendedPerson } from "@/lib/types";

const CHECKED = "2026-10-31";

/** Needs-based suggested roles. No individual is named because none was verified. */
export const recommendedPeople: RecommendedPerson[] = [
  {
    id: "cradle-programme-officer",
    role: "Programme officer, CIP Sprint (Cradle Investment Programme)",
    organisation: "Cradle Fund",
    country: "Malaysia",
    category: "programme_representative",
    expertise: ["Commercialisation grants", "CIP Sprint eligibility", "Malaysian startup ecosystem"],
    relevanceExplanation:
      "CanopyIQ's top priority is commercialisation funding, and CIP Sprint is Cradle Fund's commercialisation grant for Malaysian technology companies. A person in this role typically answers questions on eligibility and intake — important because CanopyIQ's incorporation details are not yet confirmed.",
    reasonToConnect:
      "Confirm the current intake and how CanopyIQ's incorporation, revenue and IP position map to the CIP Sprint criteria.",
    publicProfileUrl: "https://www.cradle.com.my/contact-us/",
    contactType: "suggested_role",
    relatedOpportunityId: "cradle-cip-sprint",
    focusKeywords: ["commercialisation", "grant", "technology", "software", "platform", "funding"],
    evidence: [
      {
        claim: "Cradle Fund runs CIP Sprint, a commercialisation grant for technology companies.",
        sourceTitle: "CIP Sprint – Cradle Fund",
        sourceUrl: "https://www.cradle.com.my/cip-sprint/",
        excerpt: "CIP Sprint is a CONDITIONAL Convertible Commercialisation Grant.",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "fgv-agri-innovation-lead",
    role: "Head of Plantation Digitalisation / Agri Innovation",
    organisation: "FGV Holdings Berhad",
    country: "Malaysia",
    category: "corporate_contact",
    expertise: ["Plantation operations", "Agricultural innovation", "Value-chain traceability"],
    relevanceExplanation:
      "CanopyIQ is looking for agricultural enterprise pilot partners in Malaysia. FGV operates plantation estates and has publicly highlighted agri innovation and traceability. A person in this role typically evaluates new plantation technologies and could judge whether a crop-health monitoring pilot is worth exploring.",
    reasonToConnect:
      "Explore whether a limited crop-health and yield-risk monitoring pilot on selected estates would be useful to FGV.",
    publicProfileUrl: "https://www.fgvholdings.com/",
    contactType: "suggested_role",
    relatedOpportunityId: "fgv-holdings",
    focusKeywords: ["plantation", "crop", "yield", "agriculture", "traceability", "pilot"],
    evidence: [
      {
        claim: "FGV publicly highlights agricultural innovation.",
        sourceTitle: "FGV Holdings Berhad – Company updates",
        sourceUrl: "https://www.fgvholdings.com/",
        excerpt: "FGV Strengthens Agri Innovation, Launches Three Solutions at MAHA 2026",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "growasia-indonesia-team",
    role: "Indonesia country team, Grow Asia (PISAgro)",
    organisation: "Grow Asia — Partnership for Indonesia's Sustainable Agriculture (PISAgro)",
    country: "Indonesia",
    category: "ecosystem_connector",
    expertise: ["Indonesian agriculture partnerships", "Public-private partnerships", "Smallholder value chains"],
    relevanceExplanation:
      "CanopyIQ is exploring Indonesian market entry and needs a local implementation partner. PISAgro, Grow Asia's Indonesia chapter, is a public-private partnership with more than 85 partners in Indonesian agriculture. A person in this role typically connects technology providers with agribusinesses, NGOs and local partners.",
    reasonToConnect:
      "Learn which Indonesian agribusinesses and local implementation partners are active in digital agriculture, and which working groups are relevant.",
    publicProfileUrl: "https://www.growasia.org/indonesia",
    contactType: "suggested_role",
    relatedOpportunityId: "astra-agro-lestari",
    focusKeywords: ["agriculture", "agri", "indonesia", "smallholder", "satellite", "regional"],
    evidence: [
      {
        claim: "PISAgro is a public-private partnership addressing challenges in Indonesia's agriculture sector, with more than 85 partners.",
        sourceTitle: "Indonesia | Grow Asia",
        sourceUrl: "https://www.growasia.org/indonesia",
        excerpt: "PISAgro now has more than 85 partners",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "Grow Asia and SST Think Tank signed a Letter of Intent to explore an ASEAN space-tech agri-innovation challenge (exploratory; not a published challenge).",
        sourceTitle: "Grow Asia – In focus",
        sourceUrl: "https://www.growasia.org/",
        excerpt: "Letter of Intent to Explore ASEAN Space-Tech Agri-Innovation Challenge",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "sginnovate-investment-team",
    role: "Investment team, SGInnovate (Startup SG Equity co-investment fund manager)",
    organisation: "SGInnovate",
    country: "Singapore",
    category: "investor",
    expertise: ["Deep tech investing", "Government co-investment", "Singapore ecosystem"],
    relevanceExplanation:
      "CanopyIQ plans to expand into Singapore and builds on satellite imagery and machine learning. SGInnovate is an appointed fund manager for Startup SG Equity co-investments. A person in this role typically assesses deep tech startups and can explain what co-investment requires.",
    reasonToConnect:
      "Understand what a Singapore-based deep tech startup needs (entity, research-based IP, lead investor) before considering Startup SG Equity.",
    publicProfileUrl: "https://www.startupsg.gov.sg/programmes/4895/startup-sg-equity",
    contactType: "suggested_role",
    relatedOpportunityId: "startup-sg-equity",
    focusKeywords: ["deep tech", "machine learning", "satellite", "remote sensing", "investment", "singapore"],
    evidence: [
      {
        claim: "Startup SG Equity investments are made through appointed fund managers, including SGInnovate for co-investments.",
        sourceTitle: "Startup SG Equity – Startup SG",
        sourceUrl: "https://www.startupsg.gov.sg/programmes/4895/startup-sg-equity",
        excerpt: "Investments are made through appointed fund managers",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "google-accelerator-ai-mentor",
    role: "AI/ML technical mentor, Google for Startups Accelerator",
    organisation: "Google for Startups",
    country: "Southeast Asia",
    category: "mentor",
    expertise: ["Machine learning", "Scaling AI models", "Cloud infrastructure"],
    relevanceExplanation:
      "CanopyIQ's product depends on machine learning models for crop health and yield risk. The accelerator pairs founders with Google and industry experts on their top technical challenges. A mentor in this role typically helps improve model performance and scale AI infrastructure.",
    reasonToConnect:
      "Get guidance on scaling satellite-imagery ML models and prepare for the next accelerator cohort.",
    publicProfileUrl: "https://startup.google.com/programs/accelerator/southeast-asia/",
    contactType: "suggested_role",
    relatedOpportunityId: "google-for-startups-accelerator-sea",
    focusKeywords: ["ai", "machine learning", "cloud", "satellite", "data"],
    evidence: [
      {
        claim: "The accelerator provides dedicated mentoring from Google teams.",
        sourceTitle: "Google for Startups Accelerator: Southeast Asia",
        sourceUrl: "https://startup.google.com/programs/accelerator/southeast-asia/",
        excerpt: "Dedicated mentoring from Google teams.",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
];
