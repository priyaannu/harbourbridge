package summary

import "github.com/cloudspannerecosystem/harbourbridge/internal/reports"

type ConversionSummary struct {
	SrcTable         string
	SpTable          string
	Errors           []reports.WarningClassified
	Warnings         []reports.WarningClassified
	Suggestions      []reports.WarningClassified
	Notes            []reports.WarningClassified
	ErrorsCount      int
	WarningsCount    int
	SuggestionsCount int
	NotesCount       int
}
