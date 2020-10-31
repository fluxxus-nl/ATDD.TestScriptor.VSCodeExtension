export class StringUtils {
    text: string;
    constructor(text: string){
        this.text = text;
    }
    public titleCase(): StringUtils {
        this.text = this.text.replace(/\w+/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        return this;
    }
    public removeSpecialChars(): StringUtils {
        this.text = this.text.replace(/[^\w]/g, '');
        return this;
    }
    public value(){
        return this.text;
    }
}