codeunit 50102 "UnnumberedTestObjectFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Unnumbered test objects
    end;

    [Test]
    procedure ValidTestFunction()
    // [FEATURE] Unnumbered test objects
    begin
        // [SCENARIO] Unnumbered scenario test function with valid Given-When-Then structure
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    procedure AnotherValidTestFunction()
    // [FEATURE] Unnumbered test objects
    begin
        // [SCENARIO] Another unnumbered scenario test function with valid Given-When-Then structure
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    [HandlerFunctions('ConfirmHandler')]
    procedure AnotherNumberedValidTestFunction()
    // [FEATURE] Unnumbered test objects
    begin
        // [SCENARIO 0100] Another numbered scenario test function with valid Given-When-Then structure
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [ConfirmHandler]
    procedure ConfirmHandler(Question: Text[1024]; var Reply: Boolean)
    begin
        Reply := true;
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