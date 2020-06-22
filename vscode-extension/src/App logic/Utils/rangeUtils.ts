import { TextDocument, Range, Position } from 'vscode';

export class RangeUtils {

    public static trimRange(document: TextDocument, currentRange: Range): Range {
        let newStart: Position = currentRange.start;
        let newEnd: Position = currentRange.end;
        let searchClosingTag: boolean = false;
        for (let i = currentRange.start.line; i <= currentRange.end.line; i++) {
            let startPositionToSearch = i === currentRange.start.line ? currentRange.start.character : 0;
            let textRestOfLine = document.lineAt(i).text.substring(startPositionToSearch);
            if (searchClosingTag) {
                if (!textRestOfLine.includes('*/')) { continue; } else {
                    textRestOfLine = textRestOfLine.substring(textRestOfLine.indexOf('*/') + 2);
                    searchClosingTag = false;
                }
            }
            if (textRestOfLine.trimLeft().length > 0) {
                if (textRestOfLine.trimLeft().startsWith('//')) {
                    continue;
                } else if (textRestOfLine.trimLeft().startsWith('/*')) {
                    searchClosingTag = true;
                    i--;
                    continue;
                }
                newStart = new Position(i, document.lineAt(i).text.lastIndexOf(textRestOfLine.trimLeft()));
                break;
            }
        }
        let searchForOpeningTag: Boolean = false;
        for (let i = currentRange.end.line; i >= newStart.line; i--) {
            let endPositionToSearch = i === currentRange.end.line ? currentRange.end.character : document.lineAt(i).text.length;
            let startPositionToSearch = i === newStart.line ? newStart.character : 0;
            let textFrom0ToEndPos = document.lineAt(i).text.substring(startPositionToSearch, endPositionToSearch);
            if (searchForOpeningTag) {
                if (!textFrom0ToEndPos.includes('/*')) { continue; } else {
                    textFrom0ToEndPos = textFrom0ToEndPos.substring(0, textFrom0ToEndPos.indexOf('/*')).trimLeft();
                }
            }
            if (textFrom0ToEndPos.trimRight().length > 0) {
                if (!textFrom0ToEndPos.startsWith('//') && textFrom0ToEndPos.includes('//')) {
                    textFrom0ToEndPos = textFrom0ToEndPos.substring(0, textFrom0ToEndPos.indexOf('//')).trimRight();
                } else if (textFrom0ToEndPos.trimRight().endsWith('*/')) {
                    searchForOpeningTag = true;
                    i++;
                    continue;
                }
                let amountSpaces = textFrom0ToEndPos.length - textFrom0ToEndPos.trimRight().length;
                newEnd = new Position(i, endPositionToSearch - amountSpaces);
                break;
            }
        }
        let newRange: Range = new Range(newStart, newEnd);
        if (document.getText(newRange).startsWith('//') || document.getText(newRange).startsWith('/*')) {

        }
        return newRange;
    }
    public static getRangeOfTextInsideRange(document: TextDocument, searchRange: Range, regexToSearch: RegExp): Range | undefined {
        for (let searchLine = searchRange.start.line; searchLine < searchRange.end.line; searchLine++) {
            let characterStart = 0;
            if (searchLine == searchRange.start.line)
                characterStart = searchRange.start.character;
                
            let characterEnd = document.lineAt(searchLine).text.length;
            if (characterEnd < 0)
                characterEnd = characterStart;

            if (searchLine == searchRange.end.line)
                characterEnd = searchRange.end.character;
            let lineText = document.getText(new Range(searchLine, characterStart, searchLine, characterEnd));
            let matchArr: RegExpMatchArray | null = lineText.match(regexToSearch);
            if (matchArr) {
                let matchedText: string = matchArr[0];
                let startInsideLineText = lineText.indexOf(matchedText);
                let elementStartPos = new Position(searchLine, characterStart + startInsideLineText);
                let elementEndPos = new Position(searchLine, characterStart + startInsideLineText + matchedText.length);
                return new Range(elementStartPos, elementEndPos);
            }
        }
        return undefined;
    }
}