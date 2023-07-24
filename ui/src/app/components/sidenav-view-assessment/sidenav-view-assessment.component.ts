import { Component, OnInit } from '@angular/core'
import ConversionRate from 'src/app/model/conversion-rate'
import IViewAssesmentData from 'src/app/model/view-assesment'
import { ClickEventService } from 'src/app/services/click-event/click-event.service'
import { SidenavService } from 'src/app/services/sidenav/sidenav.service'
import IStructuredReport from '../../model/structured-report'
import { FetchService } from 'src/app/services/fetch/fetch.service'
import * as JSZip from 'jszip'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import IWarningReport, { TypeDescription, WarningDescription } from 'src/app/model/warning-report'


export interface tableHeader {
  position: number
  description: string
  tableNumbers: number
  tableNamesJoinedByComma: string
}

@Component({
  selector: 'app-sidenav-view-assessment',
  templateUrl: './sidenav-view-assessment.component.html',
  styleUrls: ['./sidenav-view-assessment.component.scss'],
  providers: [MatTableModule, MatButtonModule, NgIf, MatIconModule],
})

export class SidenavViewAssessmentComponent implements OnInit {
  tableHeaderData!: tableHeader
  structuredReport!: IStructuredReport
  tableBodyData: string[] = []
  TableHeaderData_Errors: tableHeader[] = []
  TableHeaderData_Warnings: tableHeader[] = []
  TableHeaderData_Suggestions: tableHeader[] = []
  TableHeaderData_Notes: tableHeader[] = []
  displayedColumns: string[] = ['position', 'description', 'tableNumbers']
  columnsToDisplay = ['position', 'description', 'tableNumbers']
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElements!: tableHeader | null
  srcDbType: string = ''
  connectionDetail: string = ''
  summaryText: string = ''
  warningTypes: string = ''


  conversionRateCount: ConversionRate = { good: 0, ok: 0, bad: 0 }
  conversionRatePercentage: ConversionRate = { good: 0, ok: 0, bad: 0 }
  constructor(
    private sidenav: SidenavService,
    private clickEvent: ClickEventService,
    private fetch: FetchService,
  ) { }
  dbDataSource: { title: string; source: string; destination: string }[] = []
  dbDisplayedColumns: string[] = ['title', 'source', 'destination']
  rateCountDataSource: { total: number; bad: number; ok: number; good: number }[] = []
  rateCountDisplayedColumns: string[] = ['total', 'bad', 'ok', 'good']
  ratePcDataSource: { bad: number; ok: number; good: number }[] = []
  ratePcDisplayedColumns: string[] = ['bad', 'ok', 'good']
  ngOnInit(): void {
    this.clickEvent.viewAssesment.subscribe((data: IViewAssesmentData) => {
      this.srcDbType = data.srcDbType
      this.connectionDetail = data.connectionDetail
      this.conversionRateCount = data.conversionRates
      let tableCount: number =
        this.conversionRateCount.good + this.conversionRateCount.ok + this.conversionRateCount.bad
      if (tableCount > 0) {
        for (let key in this.conversionRatePercentage) {
          this.conversionRatePercentage[key as keyof ConversionRate] = Number(
            ((this.conversionRateCount[key as keyof ConversionRate] / tableCount) * 100).toFixed(2)
          )
        }
      }
      if (this.srcDbType != '') this.setDbDataSource()
      if (tableCount > 0) {
        this.setRateCountDataSource(tableCount)
      }
    })
    this.fetch.getDStructuredReport().subscribe({
      next: (structuredReport) => {
        this.summaryText = structuredReport.summary.text
      }
    })
    this.tableHeaderData = {
      position: 0,
      description: '',
      tableNumbers: 0,
      tableNamesJoinedByComma: '',
    }
    this.GenerateWarningReport()
  }
  // isExpanded(element: any): boolean {
  //   return this.expandedElements.includes(element);
  // }
  // toggleRow(element: any): void {
  //   const index = this.expandedElements.indexOf(element);
  //   if (index >= 0) {
  //     // If the element is already expanded, remove it from the array to collapse it
  //     this.expandedElements.splice(index, 1);
  //   } else {
  //     // If the element is not expanded, add it to the array to expand it
  //     this.expandedElements.push(element);
  //   }
  // }
  closeSidenav() {
    this.sidenav.closeSidenav()
  }
  setDbDataSource() {
    this.dbDataSource = []
    this.dbDataSource.push({
      title: 'Database engine type',
      source: this.srcDbType,
      destination: 'Spanner',
    })
    this.dbDataSource.push({
      title: 'Connection details',
      source: this.connectionDetail,
      destination: 'Spanner',
    })
  }
  setRateCountDataSource(tableCount: number) {
    this.rateCountDataSource = []
    this.rateCountDataSource.push({
      total: tableCount,
      bad: this.conversionRateCount.bad,
      ok: this.conversionRateCount.ok,
      good: this.conversionRateCount.good,
    })
  }

  // downloads structured report of the migration in JSON format
  downloadStructuredReport() {
    var a = document.createElement('a')
    this.fetch.getDStructuredReport().subscribe({
      next: (res: IStructuredReport) => {
        let resJson = JSON.stringify(res).replace(/9223372036854776000/g, '9223372036854775807')
        a.href = 'data:text;charset=utf-8,' + encodeURIComponent(resJson)
        let DB: string = res.summary.dbName
        a.download = `${DB}_migration_structuredReport.json`
        a.click()
      }
    })
  }

  //downloads text report of the migration in text format in more human readable form
  downloadTextReport() {
    var a = document.createElement('a')
    this.fetch.getDTextReport().subscribe({
      next: (res: string) => {
        // calling this function to fetch 'database name' of the user database
        this.fetch.getDStructuredReport().subscribe({
          next: (prev: IStructuredReport) => {
            let DB: string = prev.summary.dbName
            a.href = 'data:text;charset=utf-8,' + encodeURIComponent(res)
            a.download = `${DB}_migration_textReport.txt`
            a.click()
          }
        })
      }
    })
  }

  downloadReports() {
    let zip = new JSZip()
    this.fetch.getDStructuredReport().subscribe({
      next: (resStructured: IStructuredReport) => {
        let fileNameHeader = resStructured.summary.dbName
        let resJson = JSON.stringify(resStructured).replace(/9223372036854776000/g, '9223372036854775807')
        let fileName = fileNameHeader + '_migration_structuredReport.json'
        // add the structured report in zip file
        zip.file(fileName, resJson)
        this.fetch.getDTextReport().subscribe({
          next: (resText: string) => {
            // add the text report in zip file
            zip.file(fileNameHeader + '_migration_textReport.txt', resText)
            // Generate the zip file asynchronously
            zip.generateAsync({ type: 'blob' })
              .then((blob: Blob) => {
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${fileNameHeader}_reports`;
                a.click();
              })
          }
        })
      }
    })
  }

  GenerateWarningReport() {
    this.fetch.getDStructuredReport().subscribe({
      next: (resStructured: IStructuredReport) => {
        let fetchedTableReports = resStructured.tableReports
        // i have to iterate over that and append table names to warnings
        var report: IWarningReport = {
          errors: new Map<string, WarningDescription>(),
          warnings: new Map<string, WarningDescription>(),
          suggestions: new Map<string, WarningDescription>(),
          notes: new Map<string, WarningDescription>(),
        }
        for (var fetchedTableReport of fetchedTableReports) {
          let allWarnings = fetchedTableReport.warnings
          for (var warning of allWarnings) {
            let defaultWarning: WarningDescription = {
              tableNumbers: 0,
              tableNames: new Map<string, boolean>(),
            }
            switch (warning.warningType) {
              case "Error":
              case "Errors":

                let errorIssues = warning.warningList
                for (var errorIssue of errorIssues) {
                  let isPresent: boolean = report.errors.has(errorIssue.issueType)
                  if (isPresent) {
                    let existingDesc = report.errors.get(errorIssue.issueType)!;
                    let descNew = {
                      tableNames: new Map(existingDesc.tableNames),
                      tableNumbers: existingDesc.tableNames.size
                    }
                    descNew.tableNames.set(fetchedTableReport.srcTableName, true)
                    descNew.tableNumbers = descNew.tableNames.size
                    report.errors.set(errorIssue.issueType, descNew)
                  } else {
                    let desc = defaultWarning
                    desc.tableNames.set(fetchedTableReport.srcTableName, true)
                    desc.tableNumbers = desc.tableNames.size
                    report.errors.set(errorIssue.issueType, desc)
                  }
                }
                break

              case "Warnings":
              case "Warning":

                let warningIssues = warning.warningList
                for (var warningIssue of warningIssues) {
                  let isPresent: boolean = report.warnings.has(warningIssue.issueType)
                  if (isPresent) {
                    let existingDesc = report.warnings.get(warningIssue.issueType)!;
                    let descNew = {
                      tableNames: new Map(existingDesc.tableNames),
                      tableNumbers: existingDesc.tableNames.size
                    }
                    descNew.tableNames.set(fetchedTableReport.srcTableName, true)
                    descNew.tableNumbers = descNew.tableNames.size
                    report.warnings.set(warningIssue.issueType, descNew)
                  } else {
                    let desc = defaultWarning
                    desc.tableNames.set(fetchedTableReport.srcTableName, true)
                    desc.tableNumbers = desc.tableNames.size
                    report.warnings.set(warningIssue.issueType, desc)
                  }
                }
                break

              case "Suggestion":
              case "Suggestions":

                let suggestionIssues = warning.warningList
                for (var suggestionIssue of suggestionIssues) {
                  let isPresent: boolean = report.suggestions.has(suggestionIssue.issueType)
                  if (isPresent) {
                    let existingDesc = report.suggestions.get(suggestionIssue.issueType)!;
                    let descNew = {
                      tableNames: new Map(existingDesc.tableNames),
                      tableNumbers: existingDesc.tableNames.size
                    }
                    descNew.tableNames.set(fetchedTableReport.srcTableName, true)
                    descNew.tableNumbers = descNew.tableNames.size
                    report.suggestions.set(suggestionIssue.issueType, descNew)
                  } else {
                    let desc = defaultWarning
                    desc.tableNames.set(fetchedTableReport.srcTableName, true)
                    desc.tableNumbers = desc.tableNames.size
                    report.suggestions.set(suggestionIssue.issueType, desc)
                  }
                }
                break

              case "Note":
              case "Notes":

                let noteIssues = warning.warningList
                for (var noteIssue of noteIssues) {
                  let isPresent: boolean = report.notes.has(noteIssue.issueType)
                  if (isPresent) {
                    let existingDesc = report.notes.get(noteIssue.issueType)!;
                    let descNew = {
                      tableNames: new Map(existingDesc.tableNames),
                      tableNumbers: existingDesc.tableNames.size
                    }
                    descNew.tableNames.set(fetchedTableReport.srcTableName, true)
                    descNew.tableNumbers = descNew.tableNames.size
                    report.notes.set(noteIssue.issueType, descNew)
                  } else {
                    let desc = defaultWarning
                    desc.tableNames.set(fetchedTableReport.srcTableName, true)
                    desc.tableNumbers = desc.tableNames.size
                    report.notes.set(noteIssue.issueType, desc)
                  }
                }
                break
            }
          }
        }

        let map_report = report.warnings
        if (map_report.size == 0) {
          console.log(map_report.size)
        } else {
          this.TableHeaderData_Warnings = []
          let i = 1;
          for (let [key, value] of map_report.entries()) {
            let tableNamesList = [...value.tableNames.keys()]
            this.TableHeaderData_Warnings.push({
              position: i,
              description: TypeDescription[key as keyof typeof TypeDescription],
              tableNumbers: value.tableNumbers,
              tableNamesJoinedByComma: tableNamesList.join(', '),
            })
            i += 1;
          }
        }
        console.log(this.TableHeaderData_Warnings)
        map_report = report.errors;
        if (map_report.size == 0) {
          console.log(map_report.size)
        } else {
          this.TableHeaderData_Errors = []
          let i = 1;
          for (let [key, value] of map_report.entries()) {
            let tableNamesList = [...value.tableNames.keys()]
            this.TableHeaderData_Errors.push({
              position: i,
              description: TypeDescription[key as keyof typeof TypeDescription],
              tableNumbers: value.tableNumbers,
              tableNamesJoinedByComma: tableNamesList.join(', '),
            })
            i += 1;
          }
          console.log(this.TableHeaderData_Errors)
        }
        map_report = report.suggestions;
        if (map_report.size == 0) {
          console.log(map_report.size)
        } else {
          this.TableHeaderData_Suggestions = []
          let i = 1;
          for (let [key, value] of map_report.entries()) {
            let tableNamesList = [...value.tableNames.keys()]
            this.TableHeaderData_Suggestions.push({
              position: i,
              description: TypeDescription[key as keyof typeof TypeDescription],
              tableNumbers: value.tableNumbers,
              tableNamesJoinedByComma: tableNamesList.join(', '),
            })
            i += 1;
          }
          console.log(this.TableHeaderData_Suggestions)
        }
        console.log(map_report)
        console.log(this.TableHeaderData_Suggestions)
        map_report = report.notes;
        if (map_report.size == 0) {
          console.log(map_report.size)
        } else {
          this.TableHeaderData_Notes = []
          let i = 1;
          for (let [key, value] of map_report.entries()) {
            let tableNamesList = [...value.tableNames.keys()]
            this.TableHeaderData_Notes.push({
              position: i,
              description: TypeDescription[key as keyof typeof TypeDescription],
              tableNumbers: value.tableNumbers,
              tableNamesJoinedByComma: tableNamesList.join(', '),
            })
            i += 1;
          }
          console.log(this.TableHeaderData_Notes)
        }
      }
    })
  }
}