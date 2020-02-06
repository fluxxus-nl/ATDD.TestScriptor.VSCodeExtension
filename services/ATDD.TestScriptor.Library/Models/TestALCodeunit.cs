using ALObjectParser.Library;
using System;
using System.Collections.Generic;
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
    }
}
