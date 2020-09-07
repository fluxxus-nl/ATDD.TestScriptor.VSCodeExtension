import { commands, Location, Position, Range, TextDocument, WorkspaceEdit } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { RangeUtils } from "./rangeUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class ElementUtils {
    static async existsProcedureCallToElementValue(document: TextDocument, positionInsideMethod: Position, type: TypeChanged, elementValue: string): Promise<boolean> {
        return (await this.getProcedureCallToElementValue(document, positionInsideMethod, type, elementValue)) != undefined;
    }

    static async getProcedureCallToElementValue(document: TextDocument, positionInsideMethod: Position, type: TypeChanged, elementValue: string): Promise<ALFullSyntaxTreeNode | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(positionInsideMethod, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
        if (!methodTreeNode)
            throw new Error('The comment is expected to be inside a procedure.');

        let procedureNameToSearch: string = TestMethodUtils.getProcedureName(type, elementValue);

        let invocationExpressions: ALFullSyntaxTreeNode[] = [];
        ALFullSyntaxTreeNodeExt.collectChildNodes(methodTreeNode, FullSyntaxTreeNodeKind.getInvocationExpression(), true, invocationExpressions);
        for (let i = 0; i < invocationExpressions.length; i++) {
            let invocationExpression: ALFullSyntaxTreeNode = invocationExpressions[i];
            if (!invocationExpression.childNodes)
                continue;

            let identifierOfProcedureCall: ALFullSyntaxTreeNode;
            if (invocationExpression.childNodes[0].kind != FullSyntaxTreeNodeKind.getMemberAccessExpression())
                identifierOfProcedureCall = invocationExpression.childNodes[0];
            else
                identifierOfProcedureCall = (<ALFullSyntaxTreeNode[]>invocationExpression.childNodes[0].childNodes)[1];

            let identifierName: string = document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierOfProcedureCall.fullSpan)));
            if (procedureNameToSearch.toLowerCase() == identifierName.toLowerCase()) {
                return identifierOfProcedureCall;
            }
        }
        return undefined;
    }
    public static renameProcedureCall(edit: WorkspaceEdit, document: TextDocument, rangeToReplace: Range, newProcedureName: string) {
        edit.replace(document.uri, rangeToReplace, newProcedureName);
    }
    public static async getRangeOfElement(document: TextDocument, scenarioValue: string, type: TypeChanged, elementValue: string): Promise<Range | undefined> {
        //TODO: Make similar to getProcedureCallToElementvalue at the top of this file.
        let rangeOfScenario: Range | undefined = this.getRangeOfScenario(document, scenarioValue);
        if (!rangeOfScenario)
            return undefined;

        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(rangeOfScenario.start, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
        if (!methodTreeNode)
            throw new Error('Scenario comment is expected to be inside a procedure.');
        let methodRange: Range = TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan);

        return this.getRangeOfElementInsideMethodRange(document, methodRange, type, elementValue);
    }
    public static getRangeOfElementInsideMethodRange(document: TextDocument, methodRange: Range, type: TypeChanged, elementValue: string): Range | undefined {
        let charsToEscape: string[] = ['(', ')', '{', '}', '.'];
        let elementValueRegexSafe = elementValue;
        charsToEscape.forEach(char => elementValueRegexSafe = elementValueRegexSafe.replace(char, '\\' + char));
        let regexElement: RegExp = new RegExp('[/][/]\\s*\\[' + TypeChanged[type] + '\\]\\s*' + elementValueRegexSafe, 'i');
        let commentRange: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, methodRange, regexElement);
        return commentRange;
    }

    public static getRangeOfScenario(document: TextDocument, scenarioValue: string, id?: number): Range | undefined {
        let idAsString: string = (id ? id : '') + '';
        let regexScenario: RegExp = new RegExp('[/][/]\\s*\\[Scenario[^\\]]*' + idAsString + '\\]\\s*' + scenarioValue, 'i');
        return RangeUtils.getRangeOfTextInsideRange(document, new Range(0, 0, document.lineCount - 1, 0), regexScenario);

        // for (let line = 0; line < document.lineCount; line++) {
        //     let match: RegExpMatchArray | null = document.lineAt(line).text.match(regexScenario);
        //     if (match && match.length > 0) {
        //         let scenarioText = match[0];
        //         let startPos = document.lineAt(line).text.indexOf(scenarioText);
        //         let endPos = startPos + scenarioText.length;
        //         return new Range(line, startPos, line, endPos);
        //     }
        // }
        // return undefined;
    }

    public static async findPositionToInsertElement(document: TextDocument, scenarioRange: Range, type: TypeChanged): Promise<Position | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);

        let typeRanges: Map<TypeChanged, Range[]> | undefined = await ElementUtils.getRangesOfElementsOfProcedure(scenarioRange.start, document);
        if (!typeRanges)
            throw new Error('Scenario comment is expected to be inside a procedure.');

        let typesToSearch: TypeChanged[] = [TypeChanged.Given, TypeChanged.When, TypeChanged.Then];
        let startIndex = type == TypeChanged.Given ? 0 : type == TypeChanged.When ? 1 : 2;
        for (; startIndex >= 0; startIndex--) {
            let rangesOfType: Range[] | undefined = typeRanges.get(typesToSearch[startIndex]);
            if (rangesOfType && rangesOfType.length > 0) {
                let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(rangesOfType[rangesOfType.length - 1].end, FullSyntaxTreeNodeKind.getAllStatementKinds())
                if (statementTreeNode)
                    return TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan).end;
                else
                    return rangesOfType[rangesOfType.length - 1].end;
            }
        }
        let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(scenarioRange.end, FullSyntaxTreeNodeKind.getAllStatementKinds())
        if (statementTreeNode)
            return TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan).end;
        else
            return scenarioRange.end;
    }

    public static async getRangesOfElementsOfProcedure(somePositionInsideProcedure: Position, document: TextDocument): Promise<Map<TypeChanged, Range[]> | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(somePositionInsideProcedure, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
        if (!methodTreeNode)
            return undefined;
        let methodRange: Range = TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan);
        return this.getRangesOfElements(methodRange, document);
    }

    public static getRangesOfElements(methodRange: Range, document: TextDocument): Map<TypeChanged, Range[]> {
        let typeRanges: Map<TypeChanged, Range[]> = new Map();
        let typesToSearch: TypeChanged[] = [TypeChanged.Given, TypeChanged.When, TypeChanged.Then];
        for (let i = 0; i < typesToSearch.length; i++) {
            typeRanges.set(typesToSearch[i], []);
            let regexType: RegExp = new RegExp('^\\s+([/][/]\\s*\\[\\s*' + TypeChanged[typesToSearch[i]] + '\\s*\\].*)', 'i');
            let restOfMethodRange: Range = methodRange;
            let typeRange: Range | undefined;
            do {
                typeRange = RangeUtils.getRangeOfTextInsideRange(document, restOfMethodRange, regexType);
                if (typeRange) {
                    restOfMethodRange = new Range(typeRange.end, restOfMethodRange.end);
                    typeRanges.get(typesToSearch[i])?.push(typeRange);
                }
            } while (typeRange);
        }
        return typeRanges;
    }
    public static addElement(edit: WorkspaceEdit, document: TextDocument, positionToInsert: Position, type: TypeChanged, elementValue: string) {
        let textToAdd: string = '';
        textToAdd += '        // [' + TypeChanged[type] + ']' + elementValue;
        edit.insert(document.uri, positionToInsert, textToAdd);
    }
    public static async deleteElement(edit: WorkspaceEdit, document: TextDocument, rangeToDelete: Range) {
        edit.delete(document.uri, rangeToDelete);
    }
    public static addProcedureCall(edit: WorkspaceEdit, document: TextDocument, positionToInsert: Position, procedureName: string) {
        let textToAdd: string = '\r\n';
        textToAdd += '        ' + procedureName + '();\r\n';
        let currentLineText: string = document.lineAt(positionToInsert.line).text.trim();
        if (currentLineText != '' && currentLineText != 'end;')
            textToAdd += '\r\n';
        edit.insert(document.uri, positionToInsert, textToAdd);
    }


    public static async deleteElementWithProcedureCall(edit: WorkspaceEdit, msg: MessageUpdate, document: TextDocument) {
        let rangeOfElement: Range | undefined = await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Type, msg.OldValue);
        if (!rangeOfElement)
            throw new Error('Element ' + msg.OldValue + ' not found in scenario \'' + msg.Scenario + '\'.');

        //search for procedurecall    
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(rangeOfElement.start, FullSyntaxTreeNodeKind.getAllStatementKinds());
        if (statementTreeNode) {
            let statementRange: Range = TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan);
            edit.delete(document.uri, statementRange);
            if (msg.DeleteProcedure) {
                let procedureName = TestMethodUtils.getProcedureName(msg.Type, msg.OldValue);
                let invocationRange: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, statementRange, new RegExp(procedureName + '\\(', 'i'))
                if (invocationRange) {
                    let procedureDeclaration: Location[] | undefined = await commands.executeCommand('vscode.executeDefinitionProvider', document.uri, invocationRange.start);
                    if (procedureDeclaration && procedureDeclaration.length > 0) {
                        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(procedureDeclaration[0].range.start, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
                        if (methodTreeNode)
                            edit.delete(document.uri, TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan));
                    }
                }
            }
        } else
            edit.delete(document.uri, new Range(rangeOfElement.start.line, 0, rangeOfElement.end.line + 1, 0));
    }
}