codeunit 50103 "TestObjectWithInitializeFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Test object with Initialize
    end;

    local procedure Initialize()
    var
        LibraryTestInitialize: Codeunit "Library - Test Initialize";
    begin
        LibraryTestInitialize.OnTestInitialize(Codeunit::"TestObjectWithInitializeFLX");

        if IsInitialized then
            exit;

        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::"TestObjectWithInitializeFLX");

        IsInitialized := true;
        Commit();

        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::"TestObjectWithInitializeFLX");
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