codeunit 50105 TestObjectWithTwoFeaturesFLX
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Feature 1
        // [FEATURE] Feature 2
    end;

    [Test]
    procedure TestFunction1()
    // [FEATURE] Feature 1
    begin
        // [SCENARIO 0001] Test function 1
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    procedure TestFunction2()
    // [FEATURE] Feature 1
    begin
        // [SCENARIO 0002] Test function 2
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    procedure TestFunction3()
    // [FEATURE] Feature 2
    begin
        // [SCENARIO 0003] Test function 3
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