const packageConfig: any = require('../../package.json');

export class LogService {

    private static _instance: LogService | undefined;

    public static get instance() {
        if (!LogService._instance) {
            LogService._instance = new LogService();
        }

        return LogService._instance;
    }

    public log(message: string, logLevel: LogLevel, optionalParams?: any) {
        let msg = this.template.replace('[level]', `[${LogLevel[logLevel]}]`).replace('[msg]', message);

        switch (logLevel) {
            default:
            case LogLevel.Info:
                if (optionalParams)
                    console.info(msg, optionalParams);
                else
                    console.info(msg);
                break;
            case LogLevel.Debug:
                let debug = packageConfig.atddDebug === true;
                if (debug !== true) {
                    return;
                }

                if (optionalParams)
                    console.debug(msg, optionalParams);
                else
                    console.debug(msg);
                break;
            case LogLevel.Warning:
                if (optionalParams)
                    console.warn(msg, optionalParams);
                else
                    console.warn(msg);
                break;
            case LogLevel.Error:
                if (optionalParams)
                    console.error(msg, optionalParams);
                else
                    console.error(msg);
                break;
        }
    }

    public debug(message: string, optionalParams?: any) {
        this.log(message, LogLevel.Debug, optionalParams);
    }

    public info(message: string, optionalParams?: any) {
        this.log(message, LogLevel.Info, optionalParams);
    }

    public warn(message: string, optionalParams?: any) {
        this.log(message, LogLevel.Warning, optionalParams);
    }

    public error(message: string, optionalParams?: any) {
        this.log(message, LogLevel.Error, optionalParams);
    }

    public get template() {
        return `[ATDD.TestScriptor][${(new Date()).toISOString()}][level]: [msg]`;
    }
}

export enum LogLevel {
    Debug,
    Info,
    Warning,
    Error
}