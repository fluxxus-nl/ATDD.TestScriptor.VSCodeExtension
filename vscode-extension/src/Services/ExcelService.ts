import { Application } from './../Application';
import { singleton } from 'aurelia-dependency-injection';
import { Message } from '../typings/types';
import { Workbook } from 'exceljs';

@singleton(true)
export class ExcelService {

    async export(entries: Array<Message>) {

        let filename = await Application.ui.filepicker({
            'Excel': ['xlsx']
        });

        if (!filename) {
            return;
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('ATDD');

        worksheet.columns = [
            { header: 'Project', key: 'project', width: 10 },
            { header: 'Feature', key: 'feature', width: 20 },
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Scenario', key: 'scenario', width: 30 },
            { header: 'MethodName', key: 'methodname', width: 30 },
            { header: 'Codeunit', key: 'codeunit', width: 30 },
            { header: 'FsPath', key: 'fspath', width: 30 },
        ];

        // Add an array of rows
        let rows = entries
            .map((m) => {
                return {
                    Project: m.Project,
                    Feature: m.Feature,
                    Id: m.Id,
                    Scenario: m.Scenario,
                    MethodName: m.MethodName,
                    Codeunit: m.Codeunit,
                    FsPath: m.FsPath
                }
            })
            .map(m => Object.values(m));
        worksheet.addRows(rows);

        await workbook.xlsx.writeFile(filename);
    }
}