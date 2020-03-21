const packageConfig: any = require('../../package.json');

export class LogService {

    private static _instance: LogService | undefined;

    public static get instance() {
        if (!LogService._instance) {
            LogService._instance = new LogService();
        }

        return LogService._instance;
    }

    public static log(message: string, logLevel: LogLevel, optionalParams?: any) {
        LogService.instance._log(message, logLevel, optionalParams);
    }

    public static debug(message: string, optionalParams?: any) {
        LogService.instance._debug(message, optionalParams);
    }

    public static info(message: string, optionalParams?: any) {
        LogService.instance._info(message, optionalParams);
    }

    public static warn(message: string, optionalParams?: any) {
        LogService.instance._warn(message, optionalParams);
    }

    public static error(message: string, optionalParams?: any) {
        LogService.instance._error(message, optionalParams);
    }

    private _log(message: string, logLevel: LogLevel, optionalParams?: any) {
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

    private _debug(message: string, optionalParams?: any) {
        this._log(message, LogLevel.Debug, optionalParams);
    }

    private _info(message: string, optionalParams?: any) {
        this._log(message, LogLevel.Info, optionalParams);
    }

    private _warn(message: string, optionalParams?: any) {
        this._log(message, LogLevel.Warning, optionalParams);
    }

    private _error(message: string, optionalParams?: any) {
        this._log(message, LogLevel.Error, optionalParams);
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