import type { StartupProfile } from "@/lib/types";

export const DEMO_STARTUP_LABEL = "Illustrative demo startup";

/**
 * CanopyIQ is a fictional startup used for the guided demo (brief §4C).
 * Stage, markets and priorities are demo assumptions. No revenue, customers,
 * employees or funding raised are stated because none exist.
 */
export const demoStartup: StartupProfile = {
  name: "CanopyIQ",
  website: "https://canopyiq.example",
  description:
    "An AI-powered agricultural intelligence platform that uses satellite imagery and connected field data to help agricultural businesses monitor crop health, predict yield risks and improve supply-chain visibility.",
  industry: ["AgriTech", "ClimateTech", "AI"],
  products: [
    "Crop monitoring",
    "Yield intelligence",
    "Agricultural analytics",
  ],
  businessModel:
    "B2B software platform for agricultural enterprises, delivered as a subscription with pilot deployments on selected sites (demo assumption).",
  targetCustomers: [
    "Plantation companies",
    "Agribusinesses",
    "Agricultural cooperatives",
    "Agricultural supply-chain and sustainability teams",
  ],
  targetMarkets: ["Malaysia", "Indonesia", "Singapore"],
  capabilities: [
    "Satellite imagery analysis",
    "Machine learning",
    "Data analytics",
    "IoT integration",
  ],
  technologies: [
    "Multispectral satellite remote sensing",
    "Machine learning models for crop health and yield risk",
    "Geospatial (GIS) data processing",
    "IoT field sensor data integration",
    "Cloud analytics dashboards",
  ],
  competitiveAdvantages: [
    "Combines satellite imagery with connected field data in a single crop-intelligence view",
    "Designed for large agricultural estates and supply chains in Southeast Asia (demo assumption)",
  ],
  stage: "Early-stage",
  growthPriorities: [
    "Secure commercialisation funding",
    "Find agricultural enterprise pilot partners",
    "Expand into regional markets (Indonesia and Singapore)",
  ],
  missingInformation: [
    "Country of incorporation and company registration details",
    "Revenue and funding history",
    "Intellectual property ownership (proprietary models, licences or patents)",
    "Team size and founder backgrounds",
    "Existing customers or pilot results",
  ],
  assumptions: [
    "CanopyIQ is an illustrative demo startup, not a real company.",
    "Stage (early-stage) is a demo assumption.",
    "Markets are demo assumptions: Malaysia is the primary market; Indonesia and Singapore are expansion markets.",
    "Growth priorities (commercialisation funding, enterprise pilot partners, regional expansion) are demo assumptions.",
    "No revenue, customer, employee or funding-raised figures are stated because none are known.",
  ],
};
