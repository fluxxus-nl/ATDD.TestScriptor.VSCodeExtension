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
        bool checkSaveChanges(MessageUpdate msg, Configurations config);
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
                AddNewElementToCode(msg, config);
            }
            else if (msg.State == MessageState.Deleted)
            {
                DeleteElementFromCode(msg, config);
            }
            else if (msg.State == MessageState.Modified)
            {
                ModifyElementFromCode(msg, config);
            }
        }

        private void AddNewElementToCode(MessageUpdate msg, Configurations config)
        {
            string scenarioName = msg.Scenario;
            TypeChanged typeChanged = msg.Type;
            string fsPath = msg.FsPath;
            string elementValue = msg.NewValue;
            if (typeChanged == TypeChanged.Feature)
            {
                List<string> fileContent = new List<string>();
                fileContent.AddRange(Library.Helpers.ALTestCodeunitHelper.GetDefaultTestCodeunitText(elementValue));
                WriteFile(fsPath, fileContent);
            }
            else
            {
                InitializeSaveChanges(msg, config, out TestALMethod testALMethod, out int scenarioLine, out int elementLine, false, out List<string> fileContent, out ScenarioElementType scenarioElementType, out string dummyProcedureNameOfElement, out string procedureNameToCall);
                if (scenarioLine == 0)
                    return;

                int lineToInsert = Library.ALMethodHelper.FindLineToInsertElement(testALMethod, fileContent, scenarioLine, scenarioElementType);
                if (lineToInsert == 0)
                    return;

                bool addLineBreak = testALMethod.Scenario.Elements.Where(e => e.Type == scenarioElementType).Count() == 0;
                
                Library.Helpers.ALTestMethodHelper.AddElement(ref fileContent, elementValue, scenarioElementType, ref lineToInsert);
                Library.Helpers.ALTestMethodHelper.AddProcedureCall(ref fileContent, procedureNameToCall, ref lineToInsert);
                Library.Helpers.ALTestCodeunitHelper.AddProcedure(ref fileContent, procedureNameToCall, config.addException);
                
                WriteFile(fsPath, fileContent);
            }
        }

        private void DeleteElementFromCode(MessageUpdate msg, Configurations config)
        {
            InitializeSaveChanges(msg, config, out TestALMethod testALMethod, out int scenarioLine, out int elementLine, true, out List<string> fileContent, out ScenarioElementType scenarioElementType, out string dummyProcedureNameOfElement, out string procedureNameOfElement);
            if (scenarioLine == 0 || elementLine == 0)
                return;

            Library.Helpers.ALTestMethodHelper.DeleteElementWithProcedureCall(ref fileContent, procedureNameOfElement, elementLine);
            if (msg.DeleteProcedure)
                Library.Helpers.ALTestCodeunitHelper.DeleteProcedure(ref fileContent, procedureNameOfElement);
            WriteFile(msg.FsPath, fileContent);
        }

        private void ModifyElementFromCode(MessageUpdate msg, Configurations config)
        {
            InitializeSaveChanges(msg, config, out TestALMethod testALMethod, out int scenarioLine, out int elementLine, false, out List<string> fileContent, out ScenarioElementType scenarioElementType, out string oldProcedureNameOfElement, out string newProcedureNameOfElement);
            if (scenarioLine == 0 || elementLine == 0)
                return;

            fileContent.RemoveAt(elementLine);
            Library.Helpers.ALTestMethodHelper.AddElement(ref fileContent, msg.NewValue, scenarioElementType, ref elementLine);
            Library.Helpers.ALTestCodeunitHelper.RenameOrOnlyAddNewProcedure(oldProcedureNameOfElement, newProcedureNameOfElement, ref fileContent, ref elementLine, config.addException);
            WriteFile(msg.FsPath, fileContent);
        }

        private void InitializeSaveChanges(MessageUpdate msg, Configurations config, out TestALMethod testALMethod, out int scenarioLine, out int elementLine, bool elementOfNewValue, out List<string> fileContent, out ScenarioElementType scenarioElementType, out string oldProcedureNameOfElement, out string newProcedureNameOfElement)
        {
            string scenarioName = msg.Scenario;
            string fsPath = msg.FsPath;
            string elementOldValue = msg.OldValue;
            string elementNewValue = msg.NewValue;
            TypeChanged typeChanged = msg.Type;
            ALTestCodeunitReader alTestCodeunitReader = new ALTestCodeunitReader();
            TestALCodeunit testCodeunit = (TestALCodeunit)alTestCodeunitReader.ReadSingle(fsPath);
            testALMethod = testCodeunit.Methods.First(m => (m.Scenario != null) && (m.Scenario.Name == scenarioName));
            scenarioElementType = Library.ALMethodHelper.ToEnum<ScenarioElementType>(typeChanged.ToString().ToUpper());

            if (elementOldValue == null)
                oldProcedureNameOfElement = "";
            else
                oldProcedureNameOfElement = Library.ALMethodHelper.GetProcedurename(scenarioElementType, elementOldValue, config.prefixGiven, config.prefixWhen, config.prefixThen);
            if (elementNewValue == null)
                newProcedureNameOfElement = "";
            else
                newProcedureNameOfElement = Library.ALMethodHelper.GetProcedurename(scenarioElementType, elementNewValue, config.prefixGiven, config.prefixWhen, config.prefixThen);

            fileContent = File.ReadAllLines(fsPath).ToList();
            elementLine = 0;
            scenarioLine = Library.Helpers.ALTestCodeunitHelper.FindScenarioLine(testALMethod.Scenario.Name, fileContent);
            if (scenarioLine == 0)
                return;

            if (elementOfNewValue)
                elementLine = Library.Helpers.ALTestCodeunitHelper.FindElementLine(fileContent, scenarioElementType, elementNewValue, scenarioLine);
            else
                elementLine = Library.Helpers.ALTestCodeunitHelper.FindElementLine(fileContent, scenarioElementType, elementOldValue, scenarioLine);
            if (elementLine == 0)
                return;
        }

        private static void WriteFile(string fsPath, List<string> fileContent)
        {
            File.WriteAllLines(fsPath, fileContent, System.Text.Encoding.Unicode);
        }

        public bool checkSaveChanges(MessageUpdate msg, Configurations config)
        {
            bool procedureCanBeRemovedAfterwards = false;
            if (msg.State == MessageState.Deleted)
            {
                ScenarioElementType scenarioElementType = Library.ALMethodHelper.ToEnum<ScenarioElementType>(msg.Type.ToString().ToUpper());
                string procedureNameOfElement = Library.ALMethodHelper.GetProcedurename(scenarioElementType, msg.NewValue, config.prefixGiven, config.prefixWhen, config.prefixThen);
                List<string> fileContent = File.ReadAllLines(msg.FsPath).ToList();
                Range? range = Library.Helpers.ALTestCodeunitHelper.FindProcedureDeclarationRange(fileContent, procedureNameOfElement);
                if (range.HasValue)
                {
                    int[] usagesOfProcedure = Library.Helpers.ALTestCodeunitHelper.FindLinesWhereProcedureIsCalled(fileContent, procedureNameOfElement);
                    procedureCanBeRemovedAfterwards = usagesOfProcedure.Length <= 1;
                }
            }
            return procedureCanBeRemovedAfterwards;
        }
    }
}
