const fs = require('fs-extra');

export async function read(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(file, "utf8", (err: any, data: any) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}