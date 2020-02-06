using ALObjectParser.Library;
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
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

                    writer.WriteLine($"{(method.IsLocal ? "local " : "")}{method.MethodKind} {method.Name}({parameterTxt}){(!String.IsNullOrEmpty(method.ReturnTypeDefinition.Name) ? ": " + method.ReturnTypeDefinition.Name : "")}");

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

                    result = stringWriter.ToString().Replace("}", "").Trim();
                }
            }

            return result;
        }

        public static string Write(this ITestFeature feature)
        {
            return $"// [FEATURE] {feature.Name}";
        }

        public static string Write(this ITestScenario scenario)
        {
            return $"// [SCENARIO #{scenario.ID:0000}] {scenario.Name}";
        }

        public static string Write(this ITestScenarioElement element)
        {
            return $"// [{element.Type}] {element.Value}";
        }

        public static string WriteMethod(this ITestScenarioElement element, ALParserConfig config = null)
        {
            var prefix = "";
            switch (element.Type)
            {
                case ScenarioElementType.GIVEN:
                    prefix = config != null ? config.GivenFunctionPrefix : "Create";
                    break;
                case
                ScenarioElementType.WHEN:
                    prefix = config != null ? config.WhenFunctionPrefix : "Assign";
                    break;
                case ScenarioElementType.THEN:
                    prefix = config != null ? config.ThenFunctionPrefix : "Verify";
                    break;
                default:
                    break;
            }

            return $"{prefix}{element.Value.SanitizeName()}";
        }

        public static string SanitizeName(this string name)
        {
            var result = 
                String.Join("", 
                    Regex
                        .Split(name, @"\W", RegexOptions.CultureInvariant)
                        .Where(s => !string.IsNullOrEmpty(s))
                        .Select(s => Regex.Replace(s, "^.", m => m.Value.ToUpperInvariant()))
                );

            return result;
        }
    }
}
