using ALObjectParser.Library;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestALCodeunit : ALCodeunit
    {
        public TestALCodeunit() : base()
        {

        }

        public new List<TestALMethod> Methods { get; set; }
        public List<ITestFeature> Features { get; set; }

        public List<TestALMethod> getMethodsByName(string methodName)
        {
            return this.Methods.Where(method => method.Name.ToLower().Equals(methodName.ToLower())).ToList();
        }
    }
}
