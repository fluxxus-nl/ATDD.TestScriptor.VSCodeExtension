using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class ALProject
    {
        public Guid id { get; set; }
        public string name { get; set; }
        public string publisher { get; set; }
        public IEnumerable<string> supportedLocales { get; set; }
        public Version? application { get; set; }
        public Version? platform { get; set; }
        public Version version { get; set; }
        public string runtime { get; set; }

        public string FilePath { get; set; }
    }
}
