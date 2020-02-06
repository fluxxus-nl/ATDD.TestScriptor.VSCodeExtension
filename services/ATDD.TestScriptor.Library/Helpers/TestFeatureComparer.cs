using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestFeatureComparer : IEqualityComparer<ITestFeature>
    {
        public bool Equals(ITestFeature x, ITestFeature y)
        {
            return x.Name == y.Name && Enumerable.SequenceEqual(x.Scenarios, y.Scenarios, new TestScenarioComparer());
        }

        public int GetHashCode(ITestFeature obj)
        {
            return (obj.Name).GetHashCode();
        }
    }
}
