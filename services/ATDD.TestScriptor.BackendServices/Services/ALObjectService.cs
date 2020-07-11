using ALObjectParser.Library;
using ATDD.TestScriptor.BackendServices.Models;
using ATDD.TestScriptor.Library;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.ObjectPool;
using Microsoft.VisualBasic;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices.ComTypes;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ATDD.TestScriptor.BackendServices.Services
{
    public interface IALObjectService
    {
        Task<List<Message>> GetTests(IEnumerable<string> paths);
        void SaveChanges(MessageUpdate msg);
    }

    public class ALObjectService : IALObjectService
    {
        public async Task<List<Message>> GetTests(IEnumerable<string> paths)
        {
            using (var collector = new ALObjectCollector())
            {
                var objects = await collector.DiscoverLocalFiles(paths.ToList());
                var result = AppendScenarios(objects);
                result.AddRange(AppendOrphanTests(objects));

                return result;
            }
        }

        public List<Message> AppendScenarios(IEnumerable<CollectorItem> objects)
        {
            var result = objects
                .SelectMany(s =>
                {
                    return (s.Symbol as TestALCodeunit).Features.SelectMany(x =>
                    {
                        return x.Scenarios.Select(sc =>
                        {
                            var msg = new Message();
                            msg.Project = s.Application;
                            msg.FsPath = s.FsPath;
                            msg.Codeunit = s.Name;
                            msg.Feature = x.Name;
                            msg.Scenario = sc.Name;
                            msg.Id = sc.ID;
                            msg.MethodName = sc.MethodName;
                            msg.Details = new MessageDetails()
                            {
                                feature = msg.Feature,
                                name = msg.Scenario,
                                given = sc.Elements.Where(w => w.Type == ScenarioElementType.GIVEN).Select(e => e.Value).ToList(),
                                when = sc.Elements.Where(w => w.Type == ScenarioElementType.WHEN).Select(e => e.Value).ToList(),
                                then = sc.Elements.Where(w => w.Type == ScenarioElementType.THEN).Select(e => e.Value).ToList(),
                            };
                            return msg;

                        });
                    });
                })
                .ToList();

            return result;
        }

        public List<Message> AppendOrphanTests(IEnumerable<CollectorItem> objects)
        {
            var result = objects
                .SelectMany(s =>
                {
                    return (s.Symbol as TestALCodeunit).Methods
                    .Where(w => w.TestMethod == true)
                    .Where(w => w.Scenario == null)
                    .Select(x =>
                    {
                        var msg = new Message();
                        msg.Project = s.Application;
                        msg.FsPath = s.FsPath;
                        msg.Codeunit = s.Name;
                        msg.Feature = String.Empty;
                        msg.Scenario = x.Name;
                        msg.MethodName = x.Name;
                        msg.Details = new MessageDetails()
                        {
                            given = new List<string>(),
                            when = new List<string>() { String.Empty },
                            then = new List<string>()
                        };
                        return msg;
                    });
                })
                .ToList();

            return result;
        }

        public void SaveChanges(MessageUpdate msg)
        {
            if (msg.State == MessageState.New)
            {
                AddNewElementToCode(msg);
            }
        }

        private void AddNewElementToCode(MessageUpdate msg)
        {
            string scenarioName = msg.Scenario;
            string fsPath = msg.FsPath;
            string newValue = msg.NewValue;
            TypeChanged typeChanged = msg.Type;
            ALTestCodeunitReader alTestCodeunitReader = new ALTestCodeunitReader();
            TestALCodeunit testCodeunit = (TestALCodeunit)alTestCodeunitReader.ReadSingle(fsPath);
            TestALMethod testALMethod = testCodeunit.Methods.First(m => m.Scenario.Name == scenarioName);

            TextInfo info = CultureInfo.CurrentCulture.TextInfo;
            string newValueTitleCase = info.ToTitleCase(Regex.Replace(newValue, @"[^\w]", ""));

            List<string> fileContent = File.ReadAllLines(fsPath).ToList();
            int scenarioLine = findScenario(testALMethod.Scenario.Name, fileContent);
            if (scenarioLine == 0)
                return;
            ScenarioElementType scenarioElementType;
            string prefix;
            switch (typeChanged)
            {
                case TypeChanged.Given:
                    scenarioElementType = ScenarioElementType.GIVEN;
                    prefix = "Create";
                    break;
                case TypeChanged.When:
                    scenarioElementType = ScenarioElementType.WHEN;
                    prefix = "";
                    break;
                case TypeChanged.Then:
                    scenarioElementType = ScenarioElementType.THEN;
                    prefix = "Verify";
                    break;
                default:
                    throw new Exception("Expected a new value for Given, When or Then.");
            }
            string procedureNameToCall = string.Format("{0}{1}", prefix, newValueTitleCase);
            int lineToInsert = findLineToInsert(testALMethod, fileContent, scenarioLine, scenarioElementType);
            if (lineToInsert == 0)
                return;

            fileContent.Insert(lineToInsert, "");
            fileContent.Insert(lineToInsert + 1, string.Format("\t\t// [{0}] {1}", scenarioElementType.ToString(), newValue));
            fileContent.Insert(lineToInsert + 2, string.Format("\t\t{0}();", procedureNameToCall));
            File.WriteAllLines(fsPath, fileContent, System.Text.Encoding.Unicode);

            if (!testCodeunit.Methods.Exists(m => m.Name.ToLower() == procedureNameToCall.ToLower()))
            {
                int lineToInsertProcedure = findLineToInsertProcedure(testCodeunit, fileContent);
                if (lineToInsertProcedure != 0)
                {
                    fileContent.Insert(lineToInsertProcedure++, "");
                    fileContent.Insert(lineToInsertProcedure++, string.Format("\tlocal procedure {0}()", procedureNameToCall));
                    fileContent.Insert(lineToInsertProcedure++, "\tbegin");
                    fileContent.Insert(lineToInsertProcedure++, string.Format("\t\tError('Procedure {0} not yet implemented.');", procedureNameToCall));
                    fileContent.Insert(lineToInsertProcedure++, "\tend;");
                }
            }
        }

        private static int findLineToInsertProcedure(TestALCodeunit testCodeunit, List<string> fileContent)
        {
            int lineToInsertProcedure = 0;
            IEnumerable<TestALMethod> helperFunctions = testCodeunit.Methods.Where(m => m.Attributes.Count == 0);
            if (helperFunctions.Count() == 0)
                helperFunctions = testCodeunit.Methods.Where(m => m.Attributes.Where(a => a.Name == "Test").Count() > 0);
            if (helperFunctions.Count() > 0)
            {
                string function = "Function";
                string end = "End";
                string searchFor = function;
                for (int i = 0; i < fileContent.Count; i++)
                {
                    if (searchFor == function)
                    {
                        if (Regex.IsMatch(fileContent[i], @"\s*(local )?procedure " + helperFunctions.Last().Name, RegexOptions.IgnoreCase))
                            searchFor = end;
                    }
                    else if (searchFor == end)
                    {
                        if (Regex.IsMatch(fileContent[i], @"\s{4}end;", RegexOptions.IgnoreCase))
                            lineToInsertProcedure = i + 1;
                    }
                }
            }

            return lineToInsertProcedure;
        }

        private static int findLineToInsert(TestALMethod testALMethod, List<string> fileContent, int scenarioLine, ScenarioElementType forType)
        {
            int lineToInsert = 0;
            IEnumerable<ITestScenarioElement> elementsOfType = testALMethod.Scenario.Elements.Where(e => e.Type == forType);
            if (elementsOfType.Count() == 0)
            {
                if (forType == ScenarioElementType.GIVEN)
                    return scenarioLine + 1;
                if (forType == ScenarioElementType.WHEN)
                    return findLineToInsert(testALMethod, fileContent, scenarioLine, ScenarioElementType.GIVEN);
                if (forType == ScenarioElementType.THEN)
                    return findLineToInsert(testALMethod, fileContent, scenarioLine, ScenarioElementType.WHEN);
            }
            else
            {
                int countElementsOfType = elementsOfType.Count();
                bool searchNextCommentOrEndOfProcedure = false;
                for (int i = scenarioLine; i < fileContent.Count; i++)
                {
                    if (!searchNextCommentOrEndOfProcedure)
                    {
                        if (Regex.IsMatch(fileContent[i], @"\s+//\s*\[\s*" + forType.ToString() + @"\s*\].*", RegexOptions.IgnoreCase))
                        {
                            countElementsOfType--;
                            searchNextCommentOrEndOfProcedure = countElementsOfType == 0;
                        }
                    }
                    else
                    {
                        if (fileContent[i].TrimStart().StartsWith("//") || Regex.IsMatch(fileContent[i], @"\s{4}end;", RegexOptions.IgnoreCase))
                        {
                            lineToInsert = i;
                            break;
                        }
                    }
                }
            }

            return lineToInsert;
        }

        private static int findScenario(string scenario, List<string> fileContent)
        {
            int scenarioLine = 0;
            for (int i = 0; i < fileContent.Count; i++)
            {
                if (Regex.IsMatch(fileContent[i], @"\s+//\s*\[Scenario.*\]\s*" + scenario, RegexOptions.IgnoreCase))
                {
                    scenarioLine = i;
                    break;
                }
            }

            return scenarioLine;
        }
    }
}
