codeunit 50200 "FirstTestObjectFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
    end;

    [Test]
    procedure FirstTestFunction()
    begin
        CreateValidGiven();
        ValidWhen();
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