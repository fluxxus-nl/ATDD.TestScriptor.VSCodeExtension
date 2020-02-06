using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestScenarioElementComparer : IEqualityComparer<ITestScenarioElement>
    {
        public bool Equals(ITestScenarioElement x, ITestScenarioElement y)
        {
            return x.Type == y.Type && x.Value == y.Value;
        }

        public int GetHashCode(ITestScenarioElement obj)
        {
            return ($"{obj.Type}{obj.Value}").GetHashCode();
        }
    }
}
