using ALObjectParser.Library;
using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestALMethod : ALMethod
    {
        public ITestScenario Scenario { get; set; }
    }
}
