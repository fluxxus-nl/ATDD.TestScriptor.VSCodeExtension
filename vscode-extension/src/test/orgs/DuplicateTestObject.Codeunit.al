codeunit 50101 "DuplicateTestObjectFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Duplicate test object
    end;

    [Test]
    procedure SecondTestFunctionWithValidGivenWhenThenStructure()
    // [FEATURE] Duplicate test object
    begin
        // [SCENARIO 0002] Second test function with valid Given-When-Then structure
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    procedure ThirdTestFunctionWithValidGivenWhenThenStructure()
    // [FEATURE] Duplicate test object
    begin
        // [SCENARIO 0003] Third test function with valid Given-When-Then structure
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
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
}