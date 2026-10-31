import type { CorporatePartner } from "@/lib/types";

const CHECKED = "2026-10-31";

export const corporatePartners: CorporatePartner[] = [
  {
    id: "fgv-holdings",
    name: "FGV Holdings Berhad",
    monogram: "FGV",
    country: "Malaysia",
    industry: "Plantation and agribusiness (palm oil, oils & fats, sugar, logistics)",
    website: "https://www.fgvholdings.com/",
    description:
      "Malaysian agribusiness group with plantation estates and mills, oils & fats, sugar, logistics and consumer products businesses.",
    markets: ["Malaysia"],
    businessPriorities: [
      "Traceability, transparency and smallholder inclusion across its palm oil value chain (FGVTOP)",
      "Agricultural innovation, including new agri solutions launched at MAHA 2026",
      "Supporting the national food security agenda",
    ],
    category: "commercial_pilot",
    opportunityType: "potential_partnership",
    focusKeywords: ["plantation", "estate", "palm oil", "crop", "yield", "traceability", "smallholder", "agriculture", "agri innovation"],
    strategicFit:
      "CanopyIQ provides satellite-based crop monitoring and yield-risk analytics, while FGV operates plantation estates and mills in Malaysia and has publicly highlighted agricultural innovation and value-chain traceability. This creates a potential fit for a pilot that evaluates crop-health monitoring and yield-risk alerts across selected estates.",
    collaboration: {
      problem:
        "Monitoring crop health and yield risk across large, dispersed estates typically depends on periodic field inspections, which can delay interventions (proposed problem — to be validated with FGV).",
      solution:
        "CanopyIQ combines satellite imagery with connected field data to flag crop-stress areas and yield risks block by block, so field teams can prioritise visits.",
      pilotScope:
        "Illustrative scope: a limited-duration pilot on a small number of selected estates, comparing CanopyIQ alerts with existing inspection records.",
      businessValue:
        "Potentially earlier detection of crop stress, better-targeted field visits and clearer yield-risk visibility for estate managers (expected value, not yet demonstrated).",
      successMetrics: [
        "Share of CanopyIQ crop-stress alerts confirmed by field inspection",
        "Time from stress detection to field intervention versus current practice",
        "Accuracy of yield-risk flags against harvest records",
        "Estate-manager adoption and feedback during the pilot",
      ],
    },
    targetContactRole: "Head of Plantation Digitalisation / Agri Innovation",
    contactApproach:
      "Approach through FGV's official corporate contact channels. Reference its public agri-innovation and traceability initiatives and request an exploratory conversation about a small pilot — not a commitment.",
    evidence: [
      {
        claim: "FGV launched FGVTOP to strengthen traceability, transparency and smallholder inclusion across its palm oil value chain.",
        sourceTitle: "FGV Holdings Berhad – Company updates",
        sourceUrl: "https://www.fgvholdings.com/",
        excerpt: "FGV Launches FGVTOP to Strengthen Traceability, Transparency and Smallholder Inclusion Across Its Palm Oil Value Chain",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "FGV publicly highlights agricultural innovation, launching three solutions at MAHA 2026.",
        sourceTitle: "FGV Holdings Berhad – Company updates",
        sourceUrl: "https://www.fgvholdings.com/",
        excerpt: "FGV Strengthens Agri Innovation, Launches Three Solutions at MAHA 2026",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "FGV positions its business around the national food security agenda.",
        sourceTitle: "FGV Holdings Berhad – Home",
        sourceUrl: "https://www.fgvholdings.com/",
        excerpt: "Responding to national food security agenda, with equitable growth",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "sd-guthrie",
    name: "SD Guthrie Berhad",
    monogram: "SDG",
    country: "Malaysia",
    industry: "Sustainable palm oil plantations",
    website: "https://www.sdguthrie.com/",
    description:
      "One of the world's leading producers of Certified Sustainable Palm Oil (CSPO), with 232 plantation estates in Malaysia, Indonesia, Papua New Guinea and Solomon Islands.",
    markets: ["Malaysia", "Indonesia", "Papua New Guinea", "Solomon Islands"],
    businessPriorities: [
      "Precision agriculture using drone and satellite imaging to map plantations",
      "Early detection of palm stress, disease and nutrient deficiencies (Vitality Index)",
      "Certified sustainable palm oil production",
    ],
    category: "technology_integration",
    opportunityType: "potential_partnership",
    focusKeywords: ["precision agriculture", "satellite", "drone", "machine learning", "plantation", "crop health", "yield", "palm oil"],
    strategicFit:
      "SD Guthrie already uses drone and satellite imaging with machine learning for its Palm Census and Vitality Index across estates in Malaysia, Indonesia, Papua New Guinea and Solomon Islands. CanopyIQ's connected field data and yield-risk analytics could complement these in-house capabilities, creating a potential fit for a technology integration trial rather than a replacement.",
    collaboration: {
      problem:
        "Combining aerial health indicators with on-the-ground field data and forward-looking yield-risk forecasts across many estates (proposed problem — to be validated with SD Guthrie).",
      solution:
        "Integrate CanopyIQ's field-data ingestion and yield-risk models with existing aerial imaging outputs through a data exchange or API.",
      pilotScope:
        "Illustrative scope: a data-integration trial on a small number of estates testing whether combined signals improve yield-risk forecasts.",
      businessValue:
        "Potentially richer yield-risk insight that builds on SD Guthrie's existing precision agriculture investment instead of duplicating it (expected value, not yet demonstrated).",
      successMetrics: [
        "Yield-risk forecast accuracy of combined signals versus aerial signals alone",
        "Effort required to connect data sources",
        "Agronomist feedback on the usefulness of combined insights",
      ],
    },
    targetContactRole: "Head of Precision Agriculture / Innovation",
    contactApproach:
      "Use SD Guthrie's official corporate contact channels and frame the conversation around complementing its published Precision Agriculture work with field data and yield-risk analytics.",
    evidence: [
      {
        claim: "SD Guthrie uses drone and satellite imaging to map its palm oil plantations.",
        sourceTitle: "Precision Agriculture | SD Guthrie",
        sourceUrl: "https://www.sdguthrie.com/innovation/precision-agriculture",
        excerpt: "By employing drone and satellite imaging technologies, rather than traditional GPS-based mapping methods, we can map our palm oil plantations with greater speed and accuracy.",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "Its Vitality Index detects early signs of stress, disease or nutrient deficiencies.",
        sourceTitle: "Precision Agriculture | SD Guthrie",
        sourceUrl: "https://www.sdguthrie.com/innovation/precision-agriculture",
        excerpt: "The Vitality Index complements this by analysing health indicators, detecting early signs of stress, disease, or nutrient deficiencies.",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "SD Guthrie has 232 plantation estates in Malaysia, Indonesia, Papua New Guinea and Solomon Islands.",
        sourceTitle: "Homepage | SD Guthrie",
        sourceUrl: "https://www.sdguthrie.com/",
        excerpt: "We operate in 12 countries and have 232 plantation estates in Malaysia, Indonesia, Papua New Guinea, and Solomon Islands, supported by 10 refineries and other assets.",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "golden-agri-resources",
    name: "Golden Agri-Resources (GAR)",
    monogram: "GAR",
    country: "Singapore",
    industry: "Palm oil plantations and agribusiness",
    website: "https://www.goldenagri.com.sg/",
    description:
      "Singapore-listed palm oil and agribusiness company with sustainability and smallholder programmes in Indonesia, including the RISE initiative.",
    markets: ["Indonesia", "Singapore"],
    businessPriorities: [
      "Traceability, deforestation-free sourcing and due diligence for EUDR readiness",
      "Smallholder empowerment in Indonesia (RISE)",
      "Fire and haze management and peat rehabilitation",
    ],
    category: "joint_development",
    opportunityType: "potential_partnership",
    focusKeywords: ["traceability", "deforestation", "satellite", "monitoring", "smallholder", "plantation", "palm oil", "supply chain"],
    strategicFit:
      "GAR publicly highlights its traceability systems, deforestation-free sourcing and EUDR due diligence alongside smallholder programmes in Indonesia. CanopyIQ's satellite imagery analysis and supply-chain visibility could support plot-level monitoring, creating a potential fit for jointly developing monitoring layers that also anchor CanopyIQ's Indonesia market entry.",
    collaboration: {
      problem:
        "Keeping plot-level monitoring of sourcing areas current across many suppliers and smallholders is data-intensive (proposed problem — to be validated with GAR).",
      solution:
        "Co-develop a satellite-based monitoring layer that combines crop-health and land-cover signals for selected sourcing areas.",
      pilotScope:
        "Illustrative scope: a joint prototype covering a sample of supplier plots in one Indonesian region.",
      businessValue:
        "Potentially faster, more frequent visibility of sourcing-area conditions to support existing traceability work (expected value, not yet demonstrated).",
      successMetrics: [
        "Share of sampled plots with up-to-date monitoring coverage",
        "Time to produce a plot-level monitoring report",
        "Agreement between satellite signals and field verification",
      ],
    },
    targetContactRole: "Head of Sustainability Technology / Traceability",
    contactApproach:
      "Contact GAR through its official contact page, referencing its published traceability and smallholder work, and propose an exploratory technical discussion.",
    evidence: [
      {
        claim: "GAR highlights traceability systems, deforestation-free sourcing and due diligence for EUDR.",
        sourceTitle: "Golden Agri-Resources – Homepage",
        sourceUrl: "https://www.goldenagri.com.sg/",
        excerpt: "See how our traceability systems, deforestation-free sourcing and due diligence help you prep for EUDR.",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "GAR runs a smallholder empowerment initiative in Indonesia (RISE).",
        sourceTitle: "Golden Agri-Resources – Homepage",
        sourceUrl: "https://www.goldenagri.com.sg/",
        excerpt: "Realising Indonesia Smallholders Empowerment (RISE)",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "GAR's sustainability work includes fire and haze management and peat rehabilitation.",
        sourceTitle: "Golden Agri-Resources – Homepage",
        sourceUrl: "https://www.goldenagri.com.sg/",
        excerpt: "Fire & Haze Management Peat Rehabilitation",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "wilmar-international",
    name: "Wilmar International",
    monogram: "WIL",
    country: "Singapore",
    industry: "Integrated agribusiness (oil palm plantations, processing, food products)",
    website: "https://www.wilmar-international.com/",
    description:
      "Singapore-headquartered integrated agribusiness group whose businesses include oil palm plantation and milling, processing and consumer food products.",
    markets: ["Singapore", "Malaysia", "Indonesia"],
    businessPriorities: [
      "Supply-chain traceability back to the plantation",
      "Smallholder fresh fruit bunch (FFB) traceability",
      "Regenerative agriculture and greenhouse gas reduction",
    ],
    category: "supplier",
    opportunityType: "potential_partnership",
    focusKeywords: ["traceability", "plantation", "smallholder", "supply chain", "regenerative agriculture", "palm oil", "monitoring"],
    strategicFit:
      "Wilmar publicly reports on traceability back to the plantation and smallholder fresh fruit bunch traceability. CanopyIQ's satellite-based crop monitoring and supply-chain visibility could provide plot-level crop signals for sourcing areas, creating a potential fit for a supplier relationship focused on traceability data.",
    collaboration: {
      problem:
        "Maintaining current, plot-level visibility of plantation and smallholder sourcing areas is resource-intensive (proposed problem — to be validated with Wilmar).",
      solution:
        "Supply satellite-derived crop and land-use signals for selected sourcing areas through CanopyIQ dashboards or data feeds.",
      pilotScope:
        "Illustrative scope: a monitoring trial for a sample of smallholder sourcing areas linked to one mill.",
      businessValue:
        "Potentially more frequent, lower-effort visibility of sourcing areas to complement existing traceability reporting (expected value, not yet demonstrated).",
      successMetrics: [
        "Share of sampled sourcing plots with current satellite monitoring",
        "Time to produce a plot-level monitoring report",
        "Sustainability-team feedback on data usefulness",
      ],
    },
    targetContactRole: "Head of Sustainability / Supply Chain Traceability",
    contactApproach:
      "Use Wilmar's official contact channels and reference its published traceability and smallholder programmes; position CanopyIQ as a potential data supplier.",
    evidence: [
      {
        claim: "Wilmar's official site has a dedicated section on traceability back to the plantation.",
        sourceTitle: "Wilmar International – Supply Chain Transformation",
        sourceUrl: "https://www.wilmar-international.com/",
        excerpt: "Traceability back to Plantation",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "Wilmar runs smallholder programmes, including smallholder FFB traceability.",
        sourceTitle: "Wilmar International – Smallholder Programmes",
        sourceUrl: "https://www.wilmar-international.com/",
        excerpt: "Smallholder Fresh Fruit Bunch Traceability",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "Wilmar's sustainability work covers greenhouse gas reduction and regenerative agriculture; it lists ISPO (Indonesia) and MSPO (Malaysia) certification.",
        sourceTitle: "Wilmar International – Sustainability",
        sourceUrl: "https://www.wilmar-international.com/",
        excerpt: "Reducing Greenhouse Gas Emissions Regenerative Agriculture",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
    ],
  },
  {
    id: "astra-agro-lestari",
    name: "PT Astra Agro Lestari Tbk",
    monogram: "AAL",
    country: "Indonesia",
    industry: "Palm oil plantations",
    website: "https://www.astra-agro.co.id/",
    description:
      "Indonesian palm oil plantation company whose official site includes sustainability sections on responsible sourcing, traceability and smallholders.",
    markets: ["Indonesia"],
    businessPriorities: [
      "Responsible sourcing and traceability",
      "Smallholder engagement",
      "Published sustainability policy and aspirations",
    ],
    category: "market_expansion",
    opportunityType: "potential_partnership",
    focusKeywords: ["plantation", "palm oil", "traceability", "smallholder", "crop", "yield", "agriculture"],
    strategicFit:
      "CanopyIQ is exploring Indonesian market entry, and Astra Agro Lestari is an Indonesian palm oil plantation company whose official site highlights traceability and smallholder engagement. This creates a potential fit for a local pilot that tests crop-health and yield-risk monitoring in Indonesian plantation conditions.",
    collaboration: {
      problem:
        "Expanding into Indonesia requires validating crop monitoring under local plantation conditions with a local operator (proposed problem — to be validated with Astra Agro Lestari).",
      solution:
        "Deploy CanopyIQ crop-health and yield-risk monitoring on selected Indonesian plantation blocks, adapted to local data sources.",
      pilotScope:
        "Illustrative scope: a limited pilot on selected blocks, run with a local implementation partner.",
      businessValue:
        "Potential plantation-level crop-health visibility for the company, and a local reference deployment for CanopyIQ's Indonesia entry (expected value, not yet demonstrated).",
      successMetrics: [
        "Share of crop-stress alerts confirmed in the field",
        "Data coverage achieved across pilot blocks",
        "Operations-team feedback on usefulness",
      ],
    },
    targetContactRole: "Head of Plantation Operations / Digital Transformation",
    contactApproach:
      "Approach via Astra Agro Lestari's official corporate channels, ideally with an introduction from an Indonesian ecosystem connector, and propose a small exploratory pilot discussion.",
    evidence: [
      {
        claim: "Astra Agro Lestari's official site has sustainability sections on responsible sourcing, traceability and smallholders.",
        sourceTitle: "Astra Agro Lestari – Prosper with the Nation",
        sourceUrl: "https://www.astra-agro.co.id/",
        excerpt: "Responsible Sourcing Traceability Smallholders",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "Astra Agro Lestari publishes a sustainability policy, report and aspirations.",
        sourceTitle: "Astra Agro Lestari – Prosper with the Nation",
        sourceUrl: "https://www.astra-agro.co.id/",
        excerpt: "Sustainability Policy Sustainability Report Sustainability Aspiration",
        sourceType: "official",
        retrievedAt: CHECKED,
        verificationStatus: "verified",
      },
      {
        claim: "Plantation scale and locations in Indonesia were not checked in UpperTune's curated record.",
        sourceTitle: "Astra Agro Lestari – Company Profile",
        sourceUrl: "https://www.astra-agro.co.id/",
        sourceType: "official",
        verificationStatus: "needs_confirmation",
      },
    ],
  },
];
