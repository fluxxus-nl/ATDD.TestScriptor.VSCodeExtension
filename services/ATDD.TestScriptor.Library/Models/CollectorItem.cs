using ALObjectParser.Library;
using System;
using System.Collections.Generic;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class CollectorItem
    {
        public CollectorItem()
        {
        }

        public ALObjectParser.ALObjectType TypeId { get; set; }
        public string Type { get; set; }
        public int? Id { get; set; }
        public string Name { get; set; }
        public string TargetObject { get; set; }
        public string Application { get; set; }
        public string Publisher { get; set; }
        public string Version { get; set; }
        public string FsPath { get; set; }
        public SymbolData SymbolData { get; set; }
        public IALObject Symbol { get; set; }
        public bool IsLocal { get; set; }
        public string ProjectPath { get; set; }
    }
}
