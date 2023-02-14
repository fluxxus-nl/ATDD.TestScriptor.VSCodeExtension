codeunit 50100 "TestObjectFLX"
{
    Subtype = Test;

    var
        IsInitialized: Boolean;

    trigger OnRun()
    begin
        // [FEATURE] First test object
    end;

    [Test]
    procedure FirstTestFunctionWithValidGivenWhenThenStructure()
    // [FEATURE] First test object
    begin
        // [SCENARIO 0001] First test function with valid Given-When-Then structure
        // [GIVEN] Valid Given
        CreateValidGiven();
        // [WHEN] Valid When
        ValidWhen();
        // [THEN] Valid Then
        VerifyValidThen();
    end;

    [Test]
    procedure SecondTestFunctionWithValidGivenWhenThenStructure()
    begin
        // [Scenario #0002] Second test function with valid Given-When-Then structure
        Initialize();
    end;

    [Test]
    procedure AnotherTestFunctionWithValidGivenWhenThenStructure()
    begin
        // [Scenario #0003] Another test function with valid Given-When-Then structure
        Initialize();
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

    local procedure Initialize()
    var
        LibraryTestInitialize: Codeunit "Library - Test Initialize";
    begin
        LibraryTestInitialize.OnTestInitialize(Codeunit::"TestObjectFLX");

        if IsInitialized then
            exit;

        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::"TestObjectFLX");

        IsInitialized := true;
        Commit();

        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::"TestObjectFLX");
    end;
}