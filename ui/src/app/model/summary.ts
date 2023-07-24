export default interface ISummary {
  SrcTable: string
  SpTable: string
  Errors: WarningClassified[]
  Warnings: WarningClassified[]
  Suggestions: WarningClassified[]
  Notes: WarningClassified[]
  ErrorsCount: number
  WarningsCount: number
  SuggestionsCount: number
  NotesCount: number
}
export interface ISummaryRow {
  type: string
  content: string
  isRead: boolean
}

export interface WarningClassified {
	issueType: string
	description: string
}
