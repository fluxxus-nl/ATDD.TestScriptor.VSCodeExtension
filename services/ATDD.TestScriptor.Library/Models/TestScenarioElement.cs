using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestScenarioElement : ITestScenarioElement
    {
        public ScenarioElementType Type { get; set; }
        public string Value { get; set; }
    }

    public enum ScenarioElementType
    {
        FEATURE = 0,
        SCENARIO,
        GIVEN,
        WHEN,
        THEN
    }

    public interface ITestScenarioElement
    {
        ScenarioElementType Type { get; set; }
        string Value { get; set; }
    }
}
