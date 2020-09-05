import { MessageDetails } from "../../typings/types";

export class MessageDetailsImpl implements MessageDetails {
    feature!: string;
    name!: string;
    given!: string[];
    when!: string[];
    then!: string[];
    constructor() {
        this.given = [];
        this.when = [];
        this.then = [];
    }
}