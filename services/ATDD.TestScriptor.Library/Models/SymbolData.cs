using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class SymbolData
    {
        public string Path { get; set; }
        public ALObjectParser.ALObjectType Type { get; set; }
        public int Index { get; set; }
        public string Name { get; set; }
        public string SymbolZipName { get; set; }
    }
}
