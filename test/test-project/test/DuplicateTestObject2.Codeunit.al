codeunit 50106 "DuplicateTestObject_2FLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Duplicate test object
        // [FEATURE] Some other feature
    end;

    [Test]
    procedure TwelfthTestFunctionWithValidGivenWhenThenStructure()
    // [FEATURE] Duplicate test object
    begin
        // [SCENARIO 0012] Twelfth test function with valid Given-When-Then structure
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    procedure ThirdteenthTestFunctionWithValidGivenWhenThenStructure()
    // [FEATURE] Some other feature
    begin
        // [SCENARIO 0013] Thirdteenth test function with valid Given-When-Then structure
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