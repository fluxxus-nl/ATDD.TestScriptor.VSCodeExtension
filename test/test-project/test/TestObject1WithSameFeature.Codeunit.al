codeunit 50107 "TestObject1WithSameFeatureFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Same Feature
    end;

    [Test]
    procedure TestFunction11()
    // [FEATURE] Same Feature
    begin
        // [SCENARIO 0011] Test function 11
        // [Given] Valid Given        
        CreateValidGiven();
        // [When] Valid When        
        ValidWhen();
        // [Then] Valid Then        
        VerifyValidThen();
    end;

    [Test]
    procedure TestFunction12()
    // [FEATURE] Same Feature
    begin
        // [SCENARIO 0012] Test function 12
        // [Given] Valid Given        
        CreateValidGiven_2();
        // [When] Valid When        
        ValidWhen_2();
        // [Then] Valid Then        
        VerifyValidThen_2();
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

    local procedure CreateValidGiven_2()
    begin
        Error('Procedure CreateValidGiven not yet implemented.');
    end;

    local procedure ValidWhen_2()
    begin
        Error('Procedure ValidWhen not yet implemented.');
    end;

    local procedure VerifyValidThen_2()
    begin
        Error('Procedure VerifyValidThen not yet implemented.');
    end;
}