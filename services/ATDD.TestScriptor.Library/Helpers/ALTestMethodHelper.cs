using ALObjectParser.Library;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace ATDD.TestScriptor.Library.Helpers
{
    public class ALTestMethodHelper
    {

        public static void AddElement(ref List<string> fileContent, string elementValue, ScenarioElementType scenarioElementType, ref int lineToInsert)
        {
            ITestScenarioElement testScenarioElement = new TestScenarioElement();
            testScenarioElement.Type = scenarioElementType;
            testScenarioElement.Value = elementValue;
            fileContent.Insert(lineToInsert++, Library.ALMethodHelper.Write(testScenarioElement));
        }
        public static void AddProcedureCall(ref List<string> fileContent, string procedureNameToCall, ref int lineToInsert)
        {
            fileContent.Insert(lineToInsert++, Library.ALMethodHelper.WriteProcedureCall(procedureNameToCall));
        }

        public static void DeleteElementWithProcedureCall(ref List<string> fileContent, string procedureNameOfElement, int elementLine)
        {
            TestALCodeunit codeunit = (TestALCodeunit)new ALTestCodeunitReader().Read(fileContent);
            TestALMethod method = ALTestCodeunitHelper.GetMethodAtLine(codeunit, elementLine);
            string commentLineText = fileContent[elementLine];
            ITestScenarioElement element = method.Scenario.Elements.First(element => element.LineText.Trim() == commentLineText.Trim());
            int deleteRange = 1;
            for(int line = elementLine + 1; line < fileContent.Count; line++)
            {
                if (Regex.IsMatch(fileContent[line], @"\s*//\s*\[.+\].*"))
                {
                    deleteRange = line - elementLine;
                    break;
                }
                if (Regex.IsMatch(fileContent[line], "^    end;", RegexOptions.IgnoreCase))
                {
                    deleteRange = line - elementLine;
                    break;
                }
            }
            
            fileContent.RemoveRange(elementLine, deleteRange);
        }
        public static void RenameProcedureCall(ref List<string> fileContent, string oldProcedureNameOfElement, string newProcedureNameOfElement, int elementLine)
        {
            fileContent[elementLine] = Regex.Replace(fileContent[elementLine], oldProcedureNameOfElement + @"\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)", newProcedureNameOfElement + "()");
        }
    }
}
