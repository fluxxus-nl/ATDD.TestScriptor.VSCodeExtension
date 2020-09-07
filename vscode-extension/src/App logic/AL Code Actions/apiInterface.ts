import { TextDocument } from "vscode";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { TypeDetectiveInterface } from "./typeDetectiveInterface";

export interface APIInterface {
    typeDetectiveFactory(document: TextDocument, treeNode: ALFullSyntaxTreeNode): TypeDetectiveInterface;
}