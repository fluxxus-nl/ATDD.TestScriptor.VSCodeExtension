codeunit 50104 "TestObjectWithUIHandlerFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Test object with UI Handler
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

    [MessageHandler]
    procedure AMessageHandler(Msg: Text)
    begin
    end;

    var
        IsInitialized: Boolean;
}