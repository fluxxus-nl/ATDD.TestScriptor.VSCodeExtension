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
    procedure NewScenario2()
    begin
        // [Scenario #0002] New Scenario (2)
        Initialize();
        // [Given] New Given
        CreateNewGiven();
        // [When] New When
        NewWhen();
        // [Then] New Then
        VerifyNewThen();
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

    local procedure CreateNewGiven()
    begin
        Error('Procedure CreateNewGiven not yet implemented.');
    end;

    local procedure NewWhen()
    begin
        Error('Procedure NewWhen not yet implemented.');
    end;

    local procedure VerifyNewThen()
    begin
        Error('Procedure VerifyNewThen not yet implemented.');
    end;
}