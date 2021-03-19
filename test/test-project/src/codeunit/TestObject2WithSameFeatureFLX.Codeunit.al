codeunit 50108 TestObject2WithSameFeatureFLX
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [FEATURE] Same Feature
    end;

    [Test]
    procedure TestFunction21()
    // [FEATURE] Same Feature
    begin
        // [SCENARIO 0011] Test function 21
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