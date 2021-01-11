codeunit 50105 "New Feature"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [Feature] New Feature
    end;

    [Test]
    procedure NewTestProcedure()
    // [Feature] New Feature
    begin
        // [Scenario #0001] New Test Procedure
    end;
}