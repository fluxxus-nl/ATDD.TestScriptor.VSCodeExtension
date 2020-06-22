import { AZSymbolInformation } from "../AL Code Outline/AZSymbolInformation";
import { AZSymbolKind } from '../AL Code Outline/azSymbolKind';

export class AZSymbolInformationExt {
    public static collectChildNodes(azSymbolInformation: AZSymbolInformation, kindsOfSymbolInformation: AZSymbolKind[], searchAllLevels: boolean, outList: AZSymbolInformation[]) {
        if (azSymbolInformation.childSymbols) {
            for (let i = 0; i < azSymbolInformation.childSymbols.length; i++) {
                if (kindsOfSymbolInformation.includes(azSymbolInformation.childSymbols[i].kind)) {
                    outList.push(azSymbolInformation.childSymbols[i]);
                }
                if (searchAllLevels) {
                    this.collectChildNodes(azSymbolInformation.childSymbols[i], kindsOfSymbolInformation, searchAllLevels, outList);
                }
            }
        }
    }
}