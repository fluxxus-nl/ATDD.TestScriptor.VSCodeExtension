codeunit 50203 "ThirdTestObjectInitializeFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
    end;

    [Test]
    procedure FourthTestFunctionWithInitialize()
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
        LibraryTestInitialize.OnTestInitialize(Codeunit::ThirdTestObjectInitializeFLX);

        if IsInitialized then
            exit;

        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::ThirdTestObjectInitializeFLX);

        IsInitialized := true;
        Commit();

        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::ThirdTestObjectInitializeFLX);
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

    var
        IsInitialized: Boolean;
}