using ALObjectParser.Library;
using ATDD.TestScriptor.BackendServices.Models;
using ATDD.TestScriptor.Library;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.ObjectPool;
using Microsoft.VisualBasic;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
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
        void SaveChanges(MessageUpdate msg, Configurations config);
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

        public void SaveChanges(MessageUpdate msg, Configurations config)
        {
            if (msg.State == MessageState.New)
            {
                AddNewElementToCode(msg);
            }
            else if (msg.State == MessageState.Deleted)
            {
                DeleteElementFromCode(msg);
            }
            else if (msg.State == MessageState.Modified)
            {
                ModifyElementFromCode(msg);
            }
        }

        private void AddNewElementToCode(MessageUpdate msg)
        {
            string scenarioName = msg.Scenario;
            TypeChanged typeChanged = msg.Type;
            string fsPath = msg.FsPath;
            string elementValue = msg.NewValue;
            if (typeChanged == TypeChanged.Feature)
            {
                List<string> fileContent = new List<string>();
                fileContent.AddRange(GetDefaultTestCodeunitText(elementValue));
                WriteFile(fsPath, fileContent);
            }
            else
            {
                ALTestCodeunitReader alTestCodeunitReader = new ALTestCodeunitReader();
                TestALCodeunit testCodeunit = (TestALCodeunit)alTestCodeunitReader.ReadSingle(fsPath);
                TestALMethod testALMethod = testCodeunit.Methods.First(m => m.Scenario.Name == scenarioName);

                List<string> fileContent = File.ReadAllLines(fsPath).ToList();
                int scenarioLine = FindScenarioLine(testALMethod.Scenario.Name, fileContent);
                if (scenarioLine == 0)
                    return;

                ScenarioElementType scenarioElementType = Library.ALMethodHelper.ToEnum<ScenarioElementType>(typeChanged.ToString().ToUpper());
                string procedureNameToCall = GetProcedurename(typeChanged, elementValue);
                int lineToInsert = FindLineToInsertElement(testALMethod, fileContent, scenarioLine, scenarioElementType);
                if (lineToInsert == 0)
                    return;

                fileContent.Insert(lineToInsert++, "");
                AddElement(ref fileContent, elementValue, typeChanged, ref lineToInsert);
                AddProcedureCall(ref fileContent, procedureNameToCall, ref lineToInsert);
                AddProcedure(ref fileContent, testCodeunit, procedureNameToCall);
                WriteFile(fsPath, fileContent);
            }

            static string[] GetDefaultTestCodeunitText(string elementValue)
            {
                string codeunitName = elementValue.Contains(' ') ? '"' + elementValue + '"' : elementValue;
                return new string[]{
                "codeunit Id " + codeunitName,
                "{",
                "\tSubtype = Test;",
                "",
                "\ttrigger OnRun()",
                "\tbegin",
                "\t\t// [Feature] " + elementValue,
                "\tend;",
                "",
                "\t[Test]",
                "\tprocedure NewTestProcedure()",
                "\tbegin",
                "\t\t// [Scenario #0001] New Test Procedure",
                "\tend;"
                };
            }
        }

        private void DeleteElementFromCode(MessageUpdate msg)
        {
            string scenarioName = msg.Scenario;
            string fsPath = msg.FsPath;
            string elementValue = msg.OldValue;
            TypeChanged typeChanged = msg.Type;
            ALTestCodeunitReader alTestCodeunitReader = new ALTestCodeunitReader();
            TestALCodeunit testCodeunit = (TestALCodeunit)alTestCodeunitReader.ReadSingle(fsPath);
            TestALMethod testALMethod = testCodeunit.Methods.First(m => m.Scenario.Name == scenarioName);

            string procedureNameOfElement = GetProcedurename(typeChanged, elementValue);

            List<string> fileContent = File.ReadAllLines(fsPath).ToList();
            int scenarioLine = FindScenarioLine(testALMethod.Scenario.Name, fileContent);
            if (scenarioLine == 0)
                return;

            ScenarioElementType scenarioElementType = Library.ALMethodHelper.ToEnum<ScenarioElementType>(typeChanged.ToString().ToUpper());
            int elementLine = FindElementLine(fileContent, scenarioElementType, elementValue, scenarioLine);
            if (elementLine == 0)
                return;

            DeleteElementWithProcedureCall(ref fileContent, procedureNameOfElement, elementLine);
            DeleteProcedure(ref fileContent, procedureNameOfElement);
            WriteFile(fsPath, fileContent);
        }

        private void ModifyElementFromCode(MessageUpdate msg)
        {
            string scenarioName = msg.Scenario;
            string fsPath = msg.FsPath;
            string elementOldValue = msg.OldValue;
            string elementNewValue = msg.NewValue;
            TypeChanged typeChanged = msg.Type;
            ALTestCodeunitReader alTestCodeunitReader = new ALTestCodeunitReader();
            TestALCodeunit testCodeunit = (TestALCodeunit)alTestCodeunitReader.ReadSingle(fsPath);
            TestALMethod testALMethod = testCodeunit.Methods.First(m => m.Scenario.Name == scenarioName);

            string oldProcedureNameOfElement = GetProcedurename(typeChanged, elementOldValue);
            string newProcedureNameOfElement = GetProcedurename(typeChanged, elementNewValue);

            List<string> fileContent = File.ReadAllLines(fsPath).ToList();
            int scenarioLine = FindScenarioLine(testALMethod.Scenario.Name, fileContent);
            if (scenarioLine == 0)
                return;

            ScenarioElementType scenarioElementType = Library.ALMethodHelper.ToEnum<ScenarioElementType>(typeChanged.ToString().ToUpper());
            int elementLine = FindElementLine(fileContent, scenarioElementType, elementOldValue, scenarioLine);
            if (elementLine == 0)
                return;

            fileContent.RemoveAt(elementLine--);
            AddElement(ref fileContent, elementNewValue, typeChanged, ref elementLine);
            RenameOrOnlyAddNewProcedure(testCodeunit, oldProcedureNameOfElement, newProcedureNameOfElement, ref fileContent, ref elementLine);
            WriteFile(fsPath, fileContent);
        }

        private static string GetProcedurename(TypeChanged typeChanged, string elementValue)
        {
            TextInfo info = CultureInfo.CurrentCulture.TextInfo;
            string elementValueTitleCase = info.ToTitleCase(Regex.Replace(elementValue, @"[^\w]", ""));
            string prefix;
            switch (typeChanged)
            {
                case TypeChanged.Given:
                    prefix = "Create";
                    break;
                case TypeChanged.When:
                    prefix = "";
                    break;
                case TypeChanged.Then:
                    prefix = "Verify";
                    break;
                default:
                    throw new Exception("Expected a new value for Given, When or Then.");
            }
            return string.Format("{0}{1}", prefix, elementValueTitleCase);
        }

        private static void AddElement(ref List<string> fileContent, string elementValue, TypeChanged typeChanged, ref int lineToInsert)
        {
            fileContent.Insert(lineToInsert++, string.Format("\t\t// [{0}] {1}", typeChanged.ToString().ToUpper(), elementValue));
        }
        private static void AddProcedureCall(ref List<string> fileContent, string procedureNameToCall, ref int lineToInsert)
        {
            fileContent.Insert(lineToInsert++, string.Format("\t\t{0}();", procedureNameToCall));
        }
        private static void AddProcedure(ref List<string> fileContent, TestALCodeunit testCodeunit, string procedureNameToCall)
        {
            if (!testCodeunit.Methods.Exists(m => m.Name.ToLower() == procedureNameToCall.ToLower()))
            {
                int lineToInsertProcedure = FindLineToInsertProcedure(testCodeunit, fileContent);
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

        private static void DeleteElementWithProcedureCall(ref List<string> fileContent, string procedureNameOfElement, int elementLine)
        {
            if (Regex.IsMatch(fileContent[elementLine + 1], string.Format(@"\s+{0}(", procedureNameOfElement), RegexOptions.IgnoreCase))
                fileContent.RemoveRange(elementLine, 2);
            else
                fileContent.RemoveAt(elementLine);
        }

        private void DeleteProcedure(ref List<string> fileContent, string procedureNameOfElement)
        {
            Range? range = FindProcedureDeclarationRange(fileContent, procedureNameOfElement);
            if (range.HasValue)
            {
                int[] usagesOfProcedure = FindLinesWhereProcedureIsCalled(fileContent, procedureNameOfElement);
                if (usagesOfProcedure.Length == 0)
                    //if user confirms procedure removal
                    fileContent.RemoveRange(range.Value.Start.Value, range.Value.End.Value - range.Value.Start.Value);
            }
        }

        private void RenameOrOnlyAddNewProcedure(TestALCodeunit testCodeunit, string oldProcedureNameOfElement, string newProcedureNameOfElement, ref List<string> fileContent, ref int elementLine)
        {
            Range? range = FindProcedureDeclarationRange(fileContent, oldProcedureNameOfElement);
            if (range.HasValue)
            {
                int[] usageOfProcedure = FindLinesWhereProcedureIsCalled(fileContent, oldProcedureNameOfElement);
                if (usageOfProcedure.Length == 1)
                    RenameProcedure(ref fileContent, oldProcedureNameOfElement, newProcedureNameOfElement, usageOfProcedure, range.Value.Start.Value);
                else
                {
                    AddProcedureCall(ref fileContent, newProcedureNameOfElement, ref elementLine);
                    AddProcedure(ref fileContent, testCodeunit, newProcedureNameOfElement);
                }
            }
        }

        private void RenameProcedure(ref List<string> fileContent, string oldProcedureNameOfElement, string newProcedureNameOfElement, int[] procedureCallLines, int procedureDeclarationLine)
        {
            foreach (int procedureCallLine in procedureCallLines)
                fileContent[procedureCallLine] = fileContent[procedureCallLine].Replace(oldProcedureNameOfElement, newProcedureNameOfElement);
            fileContent[procedureDeclarationLine] = fileContent[procedureDeclarationLine].Replace(oldProcedureNameOfElement, newProcedureNameOfElement);
        }


        private static int FindLineToInsertProcedure(TestALCodeunit testCodeunit, List<string> fileContent)
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

        private static int FindLineToInsertElement(TestALMethod testALMethod, List<string> fileContent, int scenarioLine, ScenarioElementType elementToAdd)
        {
            int lineToInsert = 0;
            IEnumerable<ITestScenarioElement> elementsOfType = testALMethod.Scenario.Elements.Where(e => e.Type == elementToAdd);
            if (elementsOfType.Count() == 0)
            {
                if (elementToAdd == ScenarioElementType.GIVEN)
                    return scenarioLine + 1;
                if (elementToAdd == ScenarioElementType.WHEN)
                    return FindLineToInsertElement(testALMethod, fileContent, scenarioLine, ScenarioElementType.GIVEN);
                if (elementToAdd == ScenarioElementType.THEN)
                    return FindLineToInsertElement(testALMethod, fileContent, scenarioLine, ScenarioElementType.WHEN);
            }
            else
            {
                int countElementsOfType = elementsOfType.Count();
                bool searchNextCommentOrEndOfProcedure = false;
                for (int i = scenarioLine; i < fileContent.Count; i++)
                {
                    if (!searchNextCommentOrEndOfProcedure)
                    {
                        if (Regex.IsMatch(fileContent[i], @"\s+//\s*\[\s*" + elementToAdd.ToString() + @"\s*\].*", RegexOptions.IgnoreCase))
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

        private int FindElementLine(List<string> fileContent, ScenarioElementType scenarioElementType, string elementValue, int startingAtLine = 0)
        {
            return FindLineUsingRegexPattern(fileContent, string.Format(@"\s*\[\s*{0}\s*\]\s*{1}", scenarioElementType.ToString(), elementValue), true, startingAtLine);
        }

        private int FindNextElementLineOrEndOfProcedure(List<string> fileContent, int startingAtLine)
        {
            return FindLineUsingRegexPattern(fileContent, @"\s*\[\s*\w+\s*\]", true, startingAtLine);
        }

        private Range? FindProcedureDeclarationRange(List<string> fileContent, string procedureNameOfElement)
        {
            int start = FindLineUsingRegexPattern(fileContent, string.Format(@"^\s*(local)?\sprocedure\s{0}\(.*\).*$", procedureNameOfElement), false);
            if (start > 0)
            {
                int end = FindLineUsingRegexPattern(fileContent, @"\s{4}end;", true, start);
                return new Range(start, end);
            }
            return null;
        }

        private int[] FindLinesWhereProcedureIsCalled(List<string> fileContent, string procedureNameOfElement)
        {
            List<int> lines = new List<int>();
            int line = 0;
            do
            {
                line = FindLineUsingRegexPattern(fileContent, string.Format(@"{0}(?<!procedure {0})\(.*)", procedureNameOfElement), false, line);
                if (line > 0)
                    lines.Add(line);
            } while (line > 0);
            return lines.ToArray();
        }

        private static int FindScenarioLine(string scenario, List<string> fileContent)
        {
            return FindLineUsingRegexPattern(fileContent, @"\s+//\s*\[Scenario.*\]\s*" + scenario, false);
        }

        private static int FindLineUsingRegexPattern(List<string> fileContent, string pattern, bool stopAtEndOfProcedure, int startingAtLine = 0)
        {
            string endOfProcedurePattern = @"^\s{4}end;";
            for (int i = startingAtLine; i < fileContent.Count; i++)
            {
                if (Regex.IsMatch(fileContent[i], pattern, RegexOptions.IgnoreCase))
                {
                    return i;
                }
                else if (stopAtEndOfProcedure && Regex.IsMatch(fileContent[i], endOfProcedurePattern, RegexOptions.IgnoreCase))
                {
                    return i;
                }
            }
            return 0;
        }
        private static void WriteFile(string fsPath, List<string> fileContent)
        {
            File.WriteAllLines(fsPath, fileContent, System.Text.Encoding.Unicode);
        }
    }
}
