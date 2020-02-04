using ALObjectParser.Library;
using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class SymbolReference
    {
        public SymbolReference()
        {
            Codeunits = new List<ALCodeunit>();
            Symbols = new List<ALObject>();
        }

        public Guid AppId { get; set; }
        public string Name { get; set; }
        public string Publisher { get; set; }
        public Version Version { get; set; }
        public IEnumerable<ALCodeunit> Codeunits { get; set; }
        public string Path { get; set; }
        public List<ALObject> Symbols { get; set; }
    }
}
