codeunit 50109 "TestObjectHoleInScenarioNosFLX"
{
    Subtype = Test;

    var
        IsInitialized: Boolean;

    trigger OnRun()
    begin
        // [FEATURE] Feature
    end;

    [Test]
    procedure TestFunctionForScenario1()
    // [FEATURE] Feature
    begin
        // [SCENARIO 0001] Test function for scenario 1
        Initialize();
    end;

    [Test]
    procedure TestFunctionorScenario3()
    // [FEATURE] Feature
    begin
        // [SCENARIO 0003] Test function for scenario 3
        Initialize();
    end;

    local procedure Initialize()
    var
        LibraryTestInitialize: Codeunit "Library - Test Initialize";
    begin
        LibraryTestInitialize.OnTestInitialize(Codeunit::"TestObjectHoleInScenarioNosFLX");

        if IsInitialized then
            exit;

        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::"TestObjectHoleInScenarioNosFLX");

        IsInitialized := true;
        Commit();

        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::"TestObjectHoleInScenarioNosFLX");
    end;
}