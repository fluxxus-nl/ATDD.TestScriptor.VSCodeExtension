using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    /// <summary>
    /// Test Scenario object
    /// </summary>
    public class TestScenario : ITestScenario
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        public TestScenario()
        {
            Elements = new List<ITestScenarioElement>();
        }

        public int ID { get; set; }
        public string Name { get; set; }
        public ITestFeature Feature { get; set; }
        public ICollection<ITestScenarioElement> Elements { get; set; }
    }

    public interface ITestScenario
    {
        int ID { get; set; }
        string Name { get; set; }
        ITestFeature Feature { get; set; }
        ICollection<ITestScenarioElement> Elements { get; set; }
    }
}
