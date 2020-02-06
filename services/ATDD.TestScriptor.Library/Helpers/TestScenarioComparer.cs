using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestScenarioComparer : IEqualityComparer<ITestScenario>
    {
        public bool Equals(ITestScenario x, ITestScenario y)
        {
            return x.Name == y.Name && x.ID == y.ID && Enumerable.SequenceEqual(x.Elements, y.Elements, new TestScenarioElementComparer());
        }

        public int GetHashCode(ITestScenario obj)
        {
            return ($"{obj.ID}{obj.Name}").GetHashCode();
        }
    }
}
