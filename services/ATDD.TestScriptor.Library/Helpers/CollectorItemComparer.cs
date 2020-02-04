using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class CollectorItemComparer : IEqualityComparer<CollectorItem>
    {
        public bool Equals(CollectorItem x, CollectorItem y)
        {
            return x.TypeId == y.TypeId && x.Id == y.Id && x.Name == y.Name && x.IsEvent == y.IsEvent && x.EventName == y.EventName;
        }

        public int GetHashCode(CollectorItem obj)
        {
            return ($"{obj.TypeId}{obj.Id}{obj.Name}{obj.IsEvent}{obj.EventName}").GetHashCode();
        }
    }
}
