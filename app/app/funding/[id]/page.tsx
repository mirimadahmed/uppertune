"use client"

import { useParams } from "next/navigation"
import { FundingDetail } from "@/components/funding/funding-detail"

export default function FundingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ? decodeURIComponent(params.id) : ""
  return <FundingDetail id={id} />
}
