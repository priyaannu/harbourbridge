package summary

import (
	"github.com/cloudspannerecosystem/harbourbridge/internal/reports"
	"github.com/cloudspannerecosystem/harbourbridge/webv2/session"
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
			Notes:       []reports.WarningClassified{},
			Warnings:    []reports.WarningClassified{},
			Errors:      []reports.WarningClassified{},
			Suggestions: []reports.WarningClassified{},
		}
		for _, x := range t.Body {
			switch x.Heading {
			case "Note", "Notes":
				{
					cs.Notes = x.WarningBody
					cs.NotesCount = len(x.WarningBody)
				}
			case "Warning", "Warnings":
				{
					cs.Warnings = x.WarningBody
					cs.WarningsCount = len(x.WarningBody)
				}
			case "Error", "Errors":
				{
					cs.Errors = x.WarningBody
					cs.ErrorsCount = len(x.WarningBody)
				}
			case "Suggestion", "Suggestions":
				{
					cs.Suggestions = x.WarningBody
					cs.SuggestionsCount = len(x.WarningBody)
				}
			}
			summary[t.SpTable] = cs
		}
	}
	return summary
}
