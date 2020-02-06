using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class TestFeature : ITestFeature
    {
        public TestFeature()
        {
            Scenarios = new List<ITestScenario>();
        }

        public string Name { get; set; }

        public ICollection<ITestScenario> Scenarios { get; set; }
    }

    public interface ITestFeature
    {
        string Name { get; set; }

        ICollection<ITestScenario> Scenarios { get; set; }
    }
}
