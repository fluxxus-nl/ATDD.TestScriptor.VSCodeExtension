using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestFeatureNameComparer : IEqualityComparer<ITestFeature>
    {
        public bool Equals(ITestFeature x, ITestFeature y)
        {
            return x.Name == y.Name;
        }

        public int GetHashCode(ITestFeature obj)
        {
            return (obj.Name).GetHashCode();
        }
    }
}
