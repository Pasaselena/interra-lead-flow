export type CampaignEmailDraft = {
  campaignId: string
  subject: string
  message: string
  recipients: { customerId: string; company: string; email: string }[]
}
export type CampaignEmail = CampaignEmailDraft & { id: string; createdAt: string }

export function hasEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
