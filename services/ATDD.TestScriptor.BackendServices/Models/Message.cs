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
        public string FsPath { get; set; }
        public string MethodName { get; set; }
        public ALTestRunnerResult TestRunnerResult { get; set; }
        public MessageDetails Details { get; set; }
    }

    public class MessageDetails
    {
        public string feature { get; set; }
        public string name { get; set; }
        public IEnumerable<string> given { get; set; }
        public IEnumerable<string> when { get; set; }
        public IEnumerable<string> then { get; set; }
    }

    public enum ALTestRunnerResult
    {
        NoInfo,
        Success,
        Failure
    }
}
