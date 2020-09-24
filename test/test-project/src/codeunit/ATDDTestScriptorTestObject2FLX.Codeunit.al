codeunit 50101 ATDDTestScriptorTestObject2FLX
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Second "Testing ATDD.TestScriptor" test object
    end;

    [Test]
    procedure SecondValidTestFunction()
    // [FEATURE] Second "Testing ATDD.TestScriptor" test object
    begin
        // [SCENARIO 0002] Second test function with valid Given-When-Then structure
        // [Given] Second Valid Given        
        CreateSecondValidGiven();
        // [When] Second Valid When        
        SecondValidWhen();
        // [Then] Second Valid Then        
        VerifySecondValidThen();
    end;

    local procedure CreateSecondValidGiven()
    begin
        Error('Procedure CreateSecondValidGiven not yet implemented.');
    end;

    local procedure SecondValidWhen()
    begin
        Error('Procedure SecondValidWhen not yet implemented.');
    end;

    local procedure VerifySecondValidThen()
    begin
        Error('Procedure VerifySecondValidThen not yet implemented.');
    end;
}