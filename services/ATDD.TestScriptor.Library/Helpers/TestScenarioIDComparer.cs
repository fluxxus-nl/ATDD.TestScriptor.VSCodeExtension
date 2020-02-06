using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestScenarioIDComparer : IEqualityComparer<ITestScenario>
    {
        public bool Equals(ITestScenario x, ITestScenario y)
        {
            return x.ID == y.ID;
        }

        public int GetHashCode(ITestScenario obj)
        {
            return ($"{obj.ID}{obj.Name}").GetHashCode();
        }
    }
}
