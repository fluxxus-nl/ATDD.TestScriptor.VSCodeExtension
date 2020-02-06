using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class ALParserConfig
    {
        public ALParserConfig()
        {
            GivenFunctionPrefix = "Create";
            WhenFunctionPrefix = "Assign";
            ThenFunctionPrefix = "Verify";
        }

        public int CodeunitId { get; set; }
        public string CodeunitName { get; set; }
        public string FilePath { get; set; }
        public bool InitializeFunction { get; set; }
        public string GivenFunctionPrefix { get; set; }
        public string WhenFunctionPrefix { get; set; }
        public string ThenFunctionPrefix { get; set; }
    }
}
