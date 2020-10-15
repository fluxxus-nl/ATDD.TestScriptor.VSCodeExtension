import { Position, Range, TextDocument, WorkspaceEdit } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { RangeUtils } from "./rangeUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class ElementUtils {
    static async existsProcedureCallToElementValue(document: TextDocument, positionOfElementValue: Position, type: TypeChanged, elementValue: string): Promise<boolean> {
        return (await this.getProcedureCallToElementValue(document, positionOfElementValue, type, elementValue)) != undefined;
    }

    static async getProcedureCallToElementValue(document: TextDocument, positionOfElementValue: Position, type: TypeChanged, elementValue: string): Promise<ALFullSyntaxTreeNode | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(positionOfElementValue, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
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

            let rangeOfInvocation: Range = TextRangeExt.createVSCodeRange(identifierOfProcedureCall.fullSpan);
            let identifierName: string = document.getText(RangeUtils.trimRange(document, rangeOfInvocation));
            if (procedureNameToSearch.toLowerCase() == identifierName.toLowerCase() &&
                (rangeOfInvocation.contains(positionOfElementValue) || rangeOfInvocation.start.isAfterOrEqual(positionOfElementValue))) {
                return identifierOfProcedureCall;
            }
        }
        return undefined;
    }
    public static renameProcedureCall(edit: WorkspaceEdit, document: TextDocument, rangeToReplace: Range, newProcedureName: string) {
        edit.replace(document.uri, rangeToReplace, newProcedureName);
    }
    public static async getRangeOfElement(document: TextDocument, scenarioValue: string, type: TypeChanged, elementId: number): Promise<Range | undefined> {
        let rangeOfScenario: Range | undefined = this.getRangeOfScenario(document, scenarioValue);
        if (!rangeOfScenario)
            return undefined;

        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(rangeOfScenario.start, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
        if (!methodTreeNode)
            throw new Error('Scenario comment is expected to be inside a procedure.');
        let methodRange: Range = TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan);

        return this.getRangeOfElementInsideMethodRange(document, methodRange, type, elementId);
    }
    public static getRangeOfElementInsideMethodRange(document: TextDocument, methodRange: Range, type: TypeChanged, elementId: number): Range | undefined {
        let rangesOfElements: Map<TypeChanged, Range[]> = this.getRangesOfElements(methodRange, document);
        let rangesOfElement: Range[] | undefined = rangesOfElements.get(type);
        if (!rangesOfElement)
            throw new Error('Expected some elements of type ' + TypeChanged[type]);
        return rangesOfElement[elementId];
    }

    public static getRangeOfScenario(document: TextDocument, scenarioValue: string, id?: number): Range | undefined {
        let idAsString: string = (id ? id : '') + '';
        let scenarioValueSafe: string = scenarioValue.replace(/([^\w 0-9])/g, '\\$1');
        let regexScenario: RegExp = new RegExp('[/][/]\\s*\\[Scenario[^\\]]*' + idAsString + '\\]\\s*' + scenarioValueSafe, 'i');
        return RangeUtils.getRangeOfTextInsideRange(document, new Range(0, 0, document.lineCount - 1, 0), regexScenario);
    }

    public static async findPositionToInsertElement(document: TextDocument, scenarioRange: Range, type: TypeChanged): Promise<{ addEmptyLine: boolean; endPositionOfPreviousLine: Position | undefined }> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);

        let typeRanges: Map<TypeChanged, Range[]> | undefined = await ElementUtils.getRangesOfElementsOfProcedure(scenarioRange.start, document);
        if (!typeRanges)
            throw new Error('Scenario comment is expected to be inside a procedure.');

        let typesToSearch: TypeChanged[] = [TypeChanged.Given, TypeChanged.When, TypeChanged.Then];
        let startIndex = type == TypeChanged.Given ? 0 : type == TypeChanged.When ? 1 : 2;
        let addEmptyLine: boolean = false;
        for (; startIndex >= 0; startIndex--) {
            let rangesOfType: Range[] | undefined = typeRanges.get(typesToSearch[startIndex]);
            if (rangesOfType && rangesOfType.length > 0) {
                let lastRangeOfType: Range = rangesOfType[rangesOfType.length - 1]
                let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(lastRangeOfType.end, FullSyntaxTreeNodeKind.getAllStatementKinds())
                if (statementTreeNode)
                    return { addEmptyLine: addEmptyLine, endPositionOfPreviousLine: RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan)).end };
                else
                    return { addEmptyLine: addEmptyLine, endPositionOfPreviousLine: RangeUtils.trimRange(document, lastRangeOfType).end };
            }
            addEmptyLine = true;
        }
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(scenarioRange.end, [FullSyntaxTreeNodeKind.getMethodDeclaration()])
        if (methodTreeNode) {
            let blockTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(methodTreeNode, FullSyntaxTreeNodeKind.getBlock(), false);
            if (blockTreeNode) {
                let firstExpressionStatement: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(blockTreeNode, FullSyntaxTreeNodeKind.getExpressionStatement(), false)
                if (firstExpressionStatement) {
                    let firstInvocationStatement: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(firstExpressionStatement, FullSyntaxTreeNodeKind.getInvocationExpression(), false)
                    if (firstInvocationStatement) {
                        if (ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, firstInvocationStatement).toLowerCase() == 'initialize')
                            return { addEmptyLine: true, endPositionOfPreviousLine: RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(firstExpressionStatement.fullSpan)).end };
                    }
                }
            }
        }
        return { addEmptyLine: true, endPositionOfPreviousLine: scenarioRange.end };
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
                    typeRange = typeRange.with(typeRange.start.with({ character: document.lineAt(typeRange.start.line).firstNonWhitespaceCharacterIndex }));
                    typeRanges.get(typesToSearch[i])?.push(typeRange);
                }
            } while (typeRange);
        }
        return typeRanges;
    }
    public static getElementComment(type: TypeChanged, elementValue: string): string {
        return '// [' + TypeChanged[type] + '] ' + elementValue;
    }
    public static addElement(edit: WorkspaceEdit, document: TextDocument, positionToInsert: Position, type: TypeChanged, elementValue: string) {
        let textToAdd: string = '\r\n';
        textToAdd += '        ' + this.getElementComment(type, elementValue);
        edit.insert(document.uri, positionToInsert, textToAdd);
    }
    public static async deleteElement(edit: WorkspaceEdit, document: TextDocument, rangeToDelete: Range) {
        edit.delete(document.uri, rangeToDelete);
    }
    public static addProcedureCall(edit: WorkspaceEdit, document: TextDocument, positionToInsert: Position, procedureName: string) {
        let textToAdd: string = '\r\n';
        textToAdd += '        ' + procedureName + '();';
        edit.insert(document.uri, positionToInsert, textToAdd);
    }


    public static async deleteElementWithProcedureCall(edit: WorkspaceEdit, msg: MessageUpdate, document: TextDocument) {
        if (!msg.ArrayIndex)
            throw new Error('ArrayIndex not passed')
        let rangeOfElement: Range | undefined = await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Type, msg.ArrayIndex);
        if (!rangeOfElement)
            throw new Error('Element ' + msg.OldValue + ' not found in scenario \'' + msg.Scenario + '\'.');

        //search for procedurecall    
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(rangeOfElement.start, FullSyntaxTreeNodeKind.getAllStatementKinds());
        if (statementTreeNode) {
            let statementRange: Range = TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan);
            let range: Range = new Range(rangeOfElement.start, RangeUtils.trimRange(document, statementRange).end)
            range = range.with(range.start.translate(-1, document.lineAt(range.start.line - 1).text.length - 1), undefined);
            // if (document.lineAt(range.start.line).isEmptyOrWhitespace)
            //     range = range.with(range.start.translate(-1, document.lineAt(range.start.line - 1).text.length - 1), undefined);
            // if (document.lineAt(range.end.line + 1).isEmptyOrWhitespace)
            //     range = range.with(undefined, range.end.translate(1, undefined))
            edit.delete(document.uri, range);
            if (msg.ProceduresToDelete)
                await this.deleteProcedures(edit, document, msg.ProceduresToDelete);
        } else
            edit.delete(document.uri, new Range(rangeOfElement.start.line, 0, rangeOfElement.end.line + 1, 0));
    }
    static async deleteProcedures(edit: WorkspaceEdit, document: TextDocument, proceduresToDelete: { procedureName: string; parameterTypes: string[]; }[]) {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNodes: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
        methodTreeNodes = methodTreeNodes.filter(method =>
            proceduresToDelete.some(procedure =>
                procedure.procedureName == ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, method) &&
                JSON.stringify(TestMethodUtils.getParameterTypesOfMethod(method, document)) == JSON.stringify(procedure.parameterTypes)
            )
        );
        methodTreeNodes = methodTreeNodes.sort((a, b) => a.fullSpan && a.fullSpan.start && b.fullSpan && b.fullSpan.start ? b.fullSpan.start.line - a.fullSpan.start.line : 0);
        methodTreeNodes.forEach(method => edit.delete(document.uri, TextRangeExt.createVSCodeRange(method.fullSpan)));
    }
}