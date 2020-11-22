import { Position, Range, TextDocument } from "vscode";
import { Message, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ObjectService } from "../Services/ObjectService";
import { RangeUtils } from "./rangeUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class ElementUtils {
    static async existsAppropriateProcedureCallToElementValue(document: TextDocument, positionOfElementValue: Position, type: TypeChanged, elementValue: string): Promise<boolean> {
        return (await this.getAppropriateProcedureCallToElementValue(document, positionOfElementValue, type, elementValue)) != undefined;
    }

    static async getAppropriateProcedureCallToElementValue(document: TextDocument, positionOfElementValue: Position, type: TypeChanged, elementValue: string): Promise<ALFullSyntaxTreeNode | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(positionOfElementValue, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
        if (!methodTreeNode)
            throw new Error('The comment is expected to be inside a procedure.');

        let procedureNamesToSearch: string[] = []
        procedureNamesToSearch.push(TestMethodUtils.getProcedureName(type, elementValue).toLowerCase());
        let procedureNameHistoryList: string[] = TestMethodUtils.getProcedureNameHistory(type, elementValue)
        for (const procedureNameHistoryEntry of procedureNameHistoryList)
            procedureNamesToSearch.push(procedureNameHistoryEntry.toLowerCase())

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
            if (procedureNamesToSearch.includes(identifierName.toLowerCase()) &&
                (rangeOfInvocation.contains(positionOfElementValue) || rangeOfInvocation.start.isAfterOrEqual(positionOfElementValue))) {
                return identifierOfProcedureCall;
            }
        }
        return undefined;
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
    public static async getFSPathOfFeature(projectName: string, featureName: string): Promise<string> {
        let projects: any[] = await new ObjectService().getProjects();
        let project: any = projects.find(project => project.name == projectName);

        let basePath = (project.FilePath as string).substr(0, (project.FilePath as string).lastIndexOf('\\'));
        let objects: Message[] = await new ObjectService().getObjects([basePath]);
        let object: Message | undefined = objects.find(object => object.Feature == featureName);
        if (!object) {
            throw new Error('Feature ' + featureName + 'not found.');
        }
        return object.FsPath;
    }
}