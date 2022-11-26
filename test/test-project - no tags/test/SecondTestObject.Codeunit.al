codeunit 50201 "SecondTestObjectFLX"
{
    Subtype = Test;

    trigger OnRun()
    begin
    end;

    [Test]
    procedure SecondTestFunction()
    begin
        CreateValidGiven();
        ValidWhen();
        VerifyValidThen();
    end;

    [Test]
    procedure ThirdTestFunction()
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