package summary

import (
	"github.com/GoogleCloudPlatform/spanner-migration-tool/internal/reports"
	"github.com/GoogleCloudPlatform/spanner-migration-tool/webv2/session"
)

// getSummary returns table wise summary of conversion.
func getSummary() map[string]ConversionSummary {
	sessionState := session.GetSessionState()
	Reports := reports.AnalyzeTables(sessionState.Conv, nil)

	summary := make(map[string]ConversionSummary)
	for _, t := range Reports {
		cs := ConversionSummary{
			SrcTable:    t.SrcTable,
			SpTable:     t.SpTable,
			Notes:       []reports.IssueClassified{},
			Warnings:    []reports.IssueClassified{},
			Errors:      []reports.IssueClassified{},
			Suggestions: []reports.IssueClassified{},
		}
		for _, x := range t.Body {
			switch x.Heading {
			case "Note", "Notes":
				{
					cs.Notes = x.IssueBody
					cs.NotesCount = len(x.IssueBody)
				}
			case "Warning", "Warnings":
				{
					cs.Warnings = x.IssueBody
					cs.WarningsCount = len(x.IssueBody)
				}
			case "Error", "Errors":
				{
					cs.Errors = x.IssueBody
					cs.ErrorsCount = len(x.IssueBody)
				}
			case "Suggestion", "Suggestions":
				{
					cs.Suggestions = x.IssueBody
					cs.SuggestionsCount = len(x.IssueBody)
				}
			}
			summary[t.SpTable] = cs
		}
	}
	return summary
}
