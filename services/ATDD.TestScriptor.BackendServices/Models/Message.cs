using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ATDD.TestScriptor.BackendServices.Models
{
    public class Message
    {
        public string Project { get; set; }
        public string Feature { get; set; }
        public string Scenario { get; set; }
        public string Codeunit { get; set; }
    }
}
