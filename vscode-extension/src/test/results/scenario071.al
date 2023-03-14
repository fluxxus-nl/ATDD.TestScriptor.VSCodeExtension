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

    var
        IsInitialized: Boolean;
}