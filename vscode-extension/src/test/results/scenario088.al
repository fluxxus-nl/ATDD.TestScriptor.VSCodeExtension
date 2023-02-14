codeunit 50100 "TestObjectFLX"
{
    Subtype = Test;

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
        // [Then] Renamed Valid Then
        CheckRenamedValidThen();
        VerifyValidThen();
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

    local procedure CheckRenamedValidThen()
    begin
        Error('Procedure CheckRenamedValidThen not yet implemented.');
    end;
}