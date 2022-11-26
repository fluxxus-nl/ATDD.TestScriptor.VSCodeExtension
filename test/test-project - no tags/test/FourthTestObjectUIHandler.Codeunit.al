codeunit 50204 "FourthTestObjectUIHandlerFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
    end;

    [Test]
    [HandlerFunctions('AMessageHandler')]
    procedure FifthTestFunctionWithUIHandler()
    begin
        Initialize();
        CreateValidGiven();
        ValidWhen();
        VerifyValidThen();
    end;

    local procedure Initialize()
    var
        LibraryTestInitialize: Codeunit "Library - Test Initialize";
    begin
        LibraryTestInitialize.OnTestInitialize(Codeunit::FourthTestObjectUIHandlerFLX);

        if IsInitialized then
            exit;

        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::FourthTestObjectUIHandlerFLX);

        IsInitialized := true;
        Commit();

        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::FourthTestObjectUIHandlerFLX);
    end;

    local procedure CreateValidGiven()
    begin
        Error('Procedure CreateValidGiven not yet implemented.');
    end;

    local procedure ValidWhen()
    begin
        Error('Procedure ValidWhen not yet implemented.');
    end;

    local procedure VerifyValidThen()
    begin
        Error('Procedure VerifyValidThen not yet implemented.');
    end;

    [MessageHandler]
    procedure AMessageHandler(Msg: Text)
    begin
    end;

    var
        IsInitialized: Boolean;
}