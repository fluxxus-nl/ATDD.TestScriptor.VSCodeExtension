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
        // [Given] new given all lowercase
        CreateNewGivenAllLowercase();
        // [WHEN] Valid When
        ValidWhen();
        // [THEN] Valid Then
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

    local procedure CreateNewGivenAllLowercase()
    begin
        Error('Procedure CreateNewGivenAllLowercase not yet implemented.');
    end;
}