using ALObjectParser.Library;
using ATDD.TestScriptor.Library.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace ATDD.TestScriptor.Library.Helpers
{
    public class ALTestCodeunitHelper
    {
        public static string[] GetDefaultTestCodeunitText(string elementValue)
        {
            string newProcedureName = "NewTestProcedure";
            TestALMethod testalMethod = new TestALMethod
            {
                MethodKind = ALMethodKind.Method,
                Name = newProcedureName,
                Scenario = new TestScenario { ID = 1, Name = "New Test Procedure", Feature = new TestFeature { Name = elementValue } },
                TestMethod = true
            };
            testalMethod.Scenario.Feature.Scenarios.Add(testalMethod.Scenario);
            testalMethod.Attributes.Add(new ALAttribute { Name = "Test" });

            string codeunitName = elementValue.Contains(' ') ? '"' + elementValue + '"' : elementValue;
            TestALCodeunit testALCodeunit = new TestALCodeunit { Type = ALObjectParser.ALObjectType.codeunit, Id = 0, Name = codeunitName };
            testALCodeunit.Methods.Add(testalMethod);
            testALCodeunit.Features.Add(testalMethod.Scenario.Feature);
            testALCodeunit.Properties.Add(new ALProperty { Name = "Subtype", Value = "Test" });

            ALTestCodeunitWriter aLTestCodeunitWriter = new ALTestCodeunitWriter();
            return aLTestCodeunitWriter.Write(testALCodeunit).Split("\r\n");
        }

        public static TestALMethod GetMethodAtLine(TestALCodeunit codeunit, int line)
        {
            return codeunit.Methods.First(method => method.MethodRange.Start.Value <= line && line <= method.MethodRange.End.Value);
        }

        public static void AddProcedure(ref List<string> fileContent, string procedureNameToCall, bool addException)
        {
            TestALCodeunit testCodeunit = (TestALCodeunit)new ALTestCodeunitReader().Read(fileContent);
            if (!testCodeunit.Methods.Exists(method => method.Name.ToLower() == procedureNameToCall.ToLower()))
            {
                int lineToInsertProcedure = FindLineToInsertProcedure(testCodeunit, fileContent);
                if (lineToInsertProcedure != 0)
                {
                    List<string> methodContentLinesOnly = new List<string>();
                    if (addException)
                        methodContentLinesOnly.Add(string.Format("Error('Procedure {0} not yet implemented.');", procedureNameToCall));
                    List<string> methodContentLines = Library.ALMethodHelper.WriteMethodBody(methodContentLinesOnly);
                    string methodContent = String.Join("\r\n", methodContentLines);
                    ALMethod alMethod = new ALMethod
                    {
                        IsLocal = true,
                        Name = procedureNameToCall,
                        MethodBody = new ALMethodBody { Content = methodContent, ContentLines = methodContentLines },
                        Content = methodContent,
                        ReturnTypeDefinition = new ALReturnTypeDefinition()
                    };

                    fileContent.Insert(lineToInsertProcedure, Library.ALMethodHelper.Write(alMethod));
                }
            }
        }

        public static void DeleteProcedure(ref List<string> fileContent, string procedureNameOfElement)
        {
            Range? range = FindProcedureDeclarationRange(fileContent, procedureNameOfElement);
            if (range.HasValue)
            {
                int[] usagesOfProcedure = FindLinesWhereProcedureIsCalled(fileContent, procedureNameOfElement);
                if (usagesOfProcedure.Length == 0)
                    fileContent.RemoveRange(range.Value.Start.Value, range.Value.End.Value - range.Value.Start.Value + 1);
            }
        }

        public static void RenameOrOnlyAddNewProcedure(string oldProcedureNameOfElement, string newProcedureNameOfElement, ref List<string> fileContent, ref int elementLine, bool addException)
        {
            Range? rangeOldProcedure = FindProcedureDeclarationRange(fileContent, oldProcedureNameOfElement);
            if (rangeOldProcedure.HasValue)
            {
                int[] usageOldProcedure = FindLinesWhereProcedureIsCalled(fileContent, oldProcedureNameOfElement);
                Range? rangeNewProcedure = FindProcedureDeclarationRange(fileContent, newProcedureNameOfElement);
                if (rangeNewProcedure.HasValue)
                {
                    if (usageOldProcedure.Length == 1)
                    {
                        ALTestMethodHelper.RenameProcedureCall(ref fileContent, oldProcedureNameOfElement, newProcedureNameOfElement, elementLine);
                        DeleteProcedure(ref fileContent, oldProcedureNameOfElement);
                    }
                }
                else
                {
                    if (usageOldProcedure.Length == 1)
                        RenameProcedureAndAllRelatedCalls(ref fileContent, oldProcedureNameOfElement, newProcedureNameOfElement, usageOldProcedure, rangeOldProcedure.Value.Start.Value);
                    else
                    {
                        ALTestMethodHelper.RenameProcedureCall(ref fileContent, oldProcedureNameOfElement, newProcedureNameOfElement, elementLine);
                        AddProcedure(ref fileContent, newProcedureNameOfElement, addException);
                    }
                }
            }
        }


        private static void RenameProcedureAndAllRelatedCalls(ref List<string> fileContent, string oldProcedureNameOfElement, string newProcedureNameOfElement, int[] procedureCallLines, int procedureDeclarationLine)
        {
            foreach (int procedureCallLine in procedureCallLines)
                fileContent[procedureCallLine] = Regex.Replace(fileContent[procedureCallLine], "\\b" + oldProcedureNameOfElement + "\\b", newProcedureNameOfElement);
            fileContent[procedureDeclarationLine] = Regex.Replace(fileContent[procedureDeclarationLine], "\\b" + oldProcedureNameOfElement + "\\b", newProcedureNameOfElement);

            for (int line = procedureDeclarationLine; line < fileContent.Count; line++)
            {
                fileContent[line] = Regex.Replace(fileContent[line], "\\b" + oldProcedureNameOfElement + "\\b", newProcedureNameOfElement);
                if (Regex.IsMatch(fileContent[line], "^\\s{4}\\}.*"))
                    break;
            }
        }

        public static int FindElementLine(List<string> fileContent, ScenarioElementType scenarioElementType, string elementValue, int startingAtLine = 0)
        {
            return FindLineUsingRegexPattern(fileContent, string.Format(@"\s*\[\s*{0}\s*\]\s*{1}", scenarioElementType.ToString(), elementValue), true, startingAtLine);
        }

        public static Range? FindProcedureDeclarationRange(List<string> fileContent, string procedureNameOfElement)
        {
            int start = FindLineUsingRegexPattern(fileContent, string.Format(@"^\s*(local)?\sprocedure\s{0}\(.*\).*$", procedureNameOfElement), false);
            if (start > 0)
            {
                int end = FindLineUsingRegexPattern(fileContent, @"\s{4}end;", true, start);
                if (fileContent[end + 1].Trim() == "")
                    end++;
                return new Range(start, end);
            }
            return null;
        }
        public static int[] FindLinesWhereProcedureIsCalled(List<string> fileContent, string procedureNameOfElement)
        {
            List<int> lines = new List<int>();
            int line = 0;
            do
            {
                line = FindLineUsingRegexPattern(fileContent, string.Format(@"{0}(?<!procedure {0}).*", procedureNameOfElement), false, line + 1);
                if (line > 0)
                    lines.Add(line);
            } while (line > 0);
            return lines.ToArray();
        }

        public static int FindScenarioLine(string scenario, List<string> fileContent)
        {
            return FindLineUsingRegexPattern(fileContent, @"\s+//\s*\[Scenario.*\]\s*" + scenario, false);
        }

        private static int FindLineToInsertProcedure(TestALCodeunit testCodeunit, List<string> fileContent)
        {
            int lineToInsertProcedure = 0;
            IEnumerable<TestALMethod> helperFunctions = testCodeunit.Methods.Where(m => m.Attributes.Count == 0);
            if (helperFunctions.Count() == 0)
                helperFunctions = testCodeunit.Methods.Where(m => m.Attributes.Where(a => a.Name.ToLower() == "test").Count() > 0);
            if (helperFunctions.Count() > 0)
            {
                string lastProcedureName = helperFunctions.Last().Name;
                int lineOfDeclarationOfLastProcedure = 0;
                for (int i = 0; i < fileContent.Count; i++)
                {
                    if (Regex.IsMatch(fileContent[i], @"\s*(local )?" + lastProcedureName, RegexOptions.IgnoreCase))
                    {
                        lineOfDeclarationOfLastProcedure = i;
                        break;
                    }
                }
                if (lineOfDeclarationOfLastProcedure == 0)
                    return 0;

                for (int i = lineOfDeclarationOfLastProcedure; i < fileContent.Count; i++)
                {
                    if (Regex.IsMatch(fileContent[i], @"\s{4}end;", RegexOptions.IgnoreCase))
                    {
                        lineToInsertProcedure = i + 1;
                    }
                }
            }

            return lineToInsertProcedure;
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
    }
}
