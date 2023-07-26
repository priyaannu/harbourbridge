export default interface IStructuredReport {
	summary: ISummary
	isSharded: boolean
	ignoredStatements: IIgnoredStatement[]
	conversionMetadata: IConversionMetadata[]
	migrationType: string
	statementStats: IStatementStats
	nameChanges: INameChange[]
	tableReports: ITableReport[]
	unexpectedConditions: IUnexpectedConditions
	schemaOnly: boolean
}

export interface ISummary {
	text: string
	rating: string
	dbName: string
}

export interface IIgnoredStatement {
	statementType: string
	statement: string
}

export interface IConversionMetadata {
	conversionType: string
	duration: number
}

export interface IStatementStat {
	statement: string
	schema: number
	data: number
	skip: number
	error: number
	totalCount: number
}

export interface IStatementStats {
	driverName: string
	statementStats: IStatementStat[]
}

export interface INameChange {
	nameChangeType: string
	sourceTable: string
	oldName: string
	newName: string
}

export interface IIssues {
	issueType: string
	issueList: IssueClassified[]
}

export interface IssueClassified {
	typeEnum: string
	description: string
}

export interface ISchemaReport {
	rating: string
	pkMissing: boolean
	warnings: number
	totalColumns: number
}

export interface IDataReport {
	rating: string
	badRows: number
	totalRows: number
	dryRun: boolean
}

export interface ITableReport {
	srcTableName: string
	spTableName: string
	schemaReport: ISchemaReport
	dataReport: IDataReport
	issues: IIssues[]
}

export interface IUnexpectedCondition {
	count: number
	condition: string
}

export interface IUnexpectedConditions {
	Reparsed: number
	unexpectedConditions: IUnexpectedCondition[]
}

