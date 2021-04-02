codeunit 50109 "New Feature"
{
    Subtype = Test;

    trigger OnRun()
    begin
        // [Feature] New Feature
    end;

    var
        IsInitialized: Boolean;

    [Test]
    procedure NewTestProcedure()
    begin
        // [Scenario #0001] New Test Procedure
        Initialize();
    end;

    local procedure Initialize()
    var
        LibraryTestInitialize: Codeunit "Library - Test Initialize";
    begin
        LibraryTestInitialize.OnTestInitialize(Codeunit::"New Feature");
        
        if IsInitialized then
            exit;
        
        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::"New Feature");
        
        IsInitialized := true;
        Commit();
        
        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::"New Feature");
    end;
}