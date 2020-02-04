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
            Extensions = new List<CollectorItem>();
        }

        public ALObjectParser.ALObjectType TypeId { get; set; }
        public string Type { get; set; }
        public int? Id { get; set; }
        public string Name { get; set; }
        public string TargetObject { get; set; }
        public string Application { get; set; }
        public string Publisher { get; set; }
        public string Version { get; set; }
        public bool CanExecute { get; set; }
        public bool CanDesign { get; set; }
        public bool CanCreatePage { get; set; }
        public string FsPath { get; set; }
        public string EventName { get; set; }
        public string EventType { get; set; }
        public IEnumerable<dynamic> Events { get; set; }
        public IEnumerable<ALParameter> EventParameters { get; set; }
        public SymbolData SymbolData { get; set; }
        public IALObject Symbol { get; set; }
        public string SubType { get; set; }
        public string Scope { get; set; }
        public bool IsEvent { get; set; }
        public bool IsLocal { get; set; }
        public IEnumerable<CollectorItem> Extensions { get; set; }
    }
}
