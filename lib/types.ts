export type Story = {
  headline: string
  summary: string
  source: string
  url?: string
  videoId?: string
}

export type Section = {
  topic: string
  type?: 'youtube'
  stories: Story[]
}
