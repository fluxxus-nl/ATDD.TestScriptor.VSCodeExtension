codeunit 50100 ATDDTestScriptorTestObjectFLX
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Testing ATDD.TestScriptor test object
    end;

    [Test]
    procedure ValidTestFunction()
    // [FEATURE] Testing ATDD.TestScriptor test object
    begin
        // [SCENARIO 0001] Test function with valid Given-When-Then structure
        // [GIVEN] Valid Given
        ValidGiven();
        // [WHEN] Valid When
        ValidWhen();
        // [THEN] Valid Then
        ValidThen();
    end;

    local procedure ValidGiven()
    begin

    end;

    local procedure ValidWhen()
    begin

    end;

    local procedure ValidThen()
    begin

    end;
}