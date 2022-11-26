codeunit 50104 "TestObjectWithUIHandlerFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Test object with UI Handler
    end;

    [Test]
    [HandlerFunctions('AMessageHandler')]
    procedure FifthTestFunctionWithValidGivenWhenThenStructureAndUIHandler()
    // [FEATURE] Test object with UI Handler
    begin
        // [SCENARIO 0005] Fifth test function with valid Given-When-Then structure and UI handler
        Initialize();
        // [GIVEN] Valid Given
        CreateValidGiven();
        // [WHEN] Valid When
        ValidWhen();
        // [THEN] Valid Then
        VerifyValidThen();
    end;

    local procedure Initialize()
    var
        LibraryTestInitialize: Codeunit "Library - Test Initialize";
    begin
        LibraryTestInitialize.OnTestInitialize(Codeunit::TestObjectWithInitializeFLX);

        if IsInitialized then
            exit;

        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::TestObjectWithInitializeFLX);

        IsInitialized := true;
        Commit();

        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::TestObjectWithInitializeFLX);
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