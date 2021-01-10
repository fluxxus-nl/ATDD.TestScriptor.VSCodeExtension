codeunit 50100 TestObjectFLX
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] First test object
    end;

    [Test]
    procedure FirstTestFunctionWithValidGivenWhenThenstructure()
    // [FEATURE] First test object
    begin
        // [SCENARIO 0001] First test function with valid Given-When-Then structure
        // [Given] Renamed Valid Given
        MakeRenamedValidGiven();
        // [WHEN] Valid When
        ValidWhen();
        // [THEN] Valid Then
        VerifyValidThen();
    end;

    local procedure MakeRenamedValidGiven()
    begin
        Error('Procedure MakeRenamedValidGiven not yet implemented.');
    end;

    local procedure ValidWhen()
    begin
        Error('Procedure ValidWhen not yet implemented.');
    end;

    local procedure VerifyValidThen()
    begin
        Error('Procedure VerifyValidThen not yet implemented.');
    end;
}