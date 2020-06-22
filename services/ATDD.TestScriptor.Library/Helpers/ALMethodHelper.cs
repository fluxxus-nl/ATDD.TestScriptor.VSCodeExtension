using ALObjectParser.Library;
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace ATDD.TestScriptor.Library
{
    public static class ALMethodHelper
    {
        public static T ToEnum<T>(this string value)
        {
            return (T)Enum.Parse(typeof(T), value, true);
        }

        public static string Write(this ALMethod method)
        {
            var result = "";
            using (var stringWriter = new StringWriter())
            {
                using (var writer = new IndentedTextWriter(stringWriter))
                {
                    writer.Indent++;
                    writer.WriteLine();

                    var parameterTxt = "";
                    if (method.Parameters.Count > 0)
                    {
                        parameterTxt = String.Join(';', method.Parameters.Select(s => $"{(s.IsVar ? "var " : "")}{s.Name}: {s.TypeDefinition.Name}"));
                    }

                    writer.WriteLine($"{(method.IsLocal ? "local " : "")}{(method.MethodKind == ALMethodKind.Method ? "procedure" : "")} {method.Name}({parameterTxt}){(!String.IsNullOrEmpty(method.ReturnTypeDefinition.Name) ? ": " + method.ReturnTypeDefinition.Name : "")}");

                    if (String.IsNullOrEmpty(method.Content))
                    {
                        writer.WriteLine("begin");
                        writer.WriteLine("end;");
                    }
                    else
                    {
                        writer.WriteLine(method.Content);
                    }

                    writer.Indent--;

                    result = stringWriter.ToString().Replace("}", "").TrimEnd();
                }
            }

            return result;
        }

        public static string Write(this ITestFeature feature)
        {
            return WriteIndentedText($"// [FEATURE] {feature.Name}", 2);
        }

        public static string Write(this ITestScenario scenario)
        {
            return WriteIndentedText($"// [SCENARIO #{scenario.ID:0000}] {scenario.Name}", 2);
        }

        public static string Write(this ITestScenarioElement element)
        {
            return WriteIndentedText($"// [{element.Type}] {element.Value}", 2);
        }
        private static string WriteIndentedText(string lines, int indent = 2)
        {
            return WriteIndentedText(lines.Split("\r\n").ToList<string>(), indent);
        }
        private static string WriteIndentedText(List<string> lines, int indent = 2)
        {
            using (var stringWriter = new StringWriter())
            {
                using (var writer = new IndentedTextWriter(stringWriter))
                {
                    writer.Indent += indent;
                    writer.WriteLine();
                    foreach (string line in lines)
                        writer.WriteLine(line);
                    writer.Indent -= indent;
                    return stringWriter.ToString().TrimEnd().Substring(stringWriter.NewLine.Count());
                }
            }
        }

        public static string GetProcedurename(string procedureName)
        {
            return GetProcedurename(ScenarioElementType.GIVEN, procedureName, "", "", "");
        }
        public static string GetProcedurename(ScenarioElementType typeChanged, string elementValue, string prefixGiven, string prefixWhen, string prefixThen)
        {
            TextInfo info = CultureInfo.CurrentCulture.TextInfo;
            string elementValueTitleCase = info.ToTitleCase(elementValue);
            elementValueTitleCase = Regex.Replace(elementValueTitleCase, @"[^\w]", "");
            string prefix;
            switch (typeChanged)
            {
                case ScenarioElementType.GIVEN:
                    prefix = prefixGiven;
                    break;
                case ScenarioElementType.WHEN:
                    prefix = prefixWhen;
                    break;
                case ScenarioElementType.THEN:
                    prefix = prefixThen;
                    break;
                default:
                    throw new Exception("Expected a new value for Given, When or Then.");
            }
            return string.Format("{0}{1}", prefix, elementValueTitleCase);
        }

        public static List<string> WriteMethodBody(List<string> methodContentLinesOnly)
        {
            using (StringWriter stringWriter = new StringWriter())
            {
                using (IndentedTextWriter writer = new IndentedTextWriter(stringWriter))
                {
                    writer.Indent++;
                    writer.WriteLine("begin");
                    writer.Indent++;
                    foreach (string line in methodContentLinesOnly)
                        writer.WriteLine(line);
                    writer.Indent--;
                    writer.WriteLine("end;");
                    writer.Indent--;
                    return stringWriter.ToString().TrimEnd().Split("\r\n").ToList<string>();
                }
            }
        }

        public static string WriteProcedureCall(string procedureNameToCall, int indent = 2)
        {
            return WriteIndentedText(procedureNameToCall + "();", indent);
        }

        public static int FindLineToInsertElement(TestALMethod testALMethod, List<string> fileContent, int scenarioLine, ScenarioElementType elementToAdd)
        {
            int lineToInsert = 0;
            IEnumerable<ITestScenarioElement> elementsOfType = testALMethod.Scenario.Elements.Where(e => e.Type == elementToAdd);
            if (elementsOfType.Count() == 0)
            {
                if (elementToAdd == ScenarioElementType.GIVEN)
                {
                    IEnumerable<ITestScenarioElement> otherElements = testALMethod.Scenario.Elements.Where(e => e.Type == ScenarioElementType.WHEN || e.Type == ScenarioElementType.THEN);
                    if (otherElements.Count() > 0)
                    {
                        ITestScenarioElement element = otherElements.First();
                        for (int lineNo = scenarioLine; lineNo < fileContent.Count; lineNo++)
                        {
                            if (fileContent[lineNo].Trim() == element.LineText.Trim())
                                return lineNo;
                            if (Regex.IsMatch(fileContent[lineNo], @"\s{4}end;", RegexOptions.IgnoreCase))
                                return lineNo;
                        }
                    }
                }
                if (elementToAdd == ScenarioElementType.WHEN)
                    return FindLineToInsertElement(testALMethod, fileContent, scenarioLine, ScenarioElementType.GIVEN);
                if (elementToAdd == ScenarioElementType.THEN)
                    return FindLineToInsertElement(testALMethod, fileContent, scenarioLine, ScenarioElementType.WHEN);
            }
            else
            {
                int countElementsOfType = elementsOfType.Count();
                int lineNo = scenarioLine;
                for (; lineNo < fileContent.Count && countElementsOfType > 0; lineNo++)
                    if (Regex.IsMatch(fileContent[lineNo], @"\s+//\s*\[\s*" + elementToAdd.ToString() + @"\s*\].*", RegexOptions.IgnoreCase))
                        countElementsOfType--;

                for (; lineNo < fileContent.Count; lineNo++)
                {
                    if (fileContent[lineNo].Trim() == "" || Regex.IsMatch(fileContent[lineNo], @"\s+//\s*\[[^]]*\].*") || Regex.IsMatch(fileContent[lineNo], @"\s{4}end;", RegexOptions.IgnoreCase))
                    {
                        lineToInsert = lineNo;
                        break;
                    }
                }
            }

            return lineToInsert;
        }
    }
}
