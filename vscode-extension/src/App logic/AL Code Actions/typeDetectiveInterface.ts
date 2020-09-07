
export interface TypeDetectiveInterface {
    getType(): string;
    getName(): string;
    getIsVar(): boolean;
    getIsTemporary(): boolean;

    analyzeTypeOfTreeNode(): Promise<void>;
}