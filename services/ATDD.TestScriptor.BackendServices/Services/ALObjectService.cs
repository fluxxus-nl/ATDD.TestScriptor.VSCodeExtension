using ALObjectParser.Library;
using ATDD.TestScriptor.BackendServices.Models;
using ATDD.TestScriptor.Library;
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
            //IEnumerable<Message> dirtyMsgs = msg.Where(m => m.IsDirty);
            //foreach (Message dirtyMsg in dirtyMsgs)
            //{
            //    List<string> fileContent = File.ReadAllLines(dirtyMsg.FsPath).ToList();

            //    int scenarioLine = 0;
            //    for (int i = 0; i < fileContent.Count; i++)
            //    {
            //        if (Regex.IsMatch(fileContent[i], @"\s+//\s*\[Scenario.*\]\s*" + dirtyMsg.Scenario, RegexOptions.IgnoreCase))
            //        {
            //            scenarioLine = i;
            //            break;
            //        }
            //    }
            //    if (scenarioLine == 0)
            //        return;
            //    int whenLine = 0;

            //    for (int i = scenarioLine; i < fileContent.Count; i++)
            //    {
            //        if (Regex.IsMatch(fileContent[i], @"\s+//\s*\[When\].*", RegexOptions.IgnoreCase))
            //        {
            //            whenLine = i;
            //            break;
            //        }
            //    }
            //    if (whenLine == 0)
            //        return;


            //    bool madeChanges = false;
            //    for (int a = dirtyMsg.Details.given.ToList().Count - 1; a >= 0; a--)
            //    {
            //        string given = dirtyMsg.Details.given.ToList()[a];
            //        bool found = false;
            //        for (int i = scenarioLine; i < fileContent.Count; i++)
            //        {
            //            if (Regex.IsMatch(fileContent[i], @"\s+//\s*\[Given\]\s*" + given, RegexOptions.IgnoreCase))
            //            {
            //                found = true;
            //            }
            //        }
            //        if (!found)
            //        {
            //            var givenTitleCase = new Regex(@"[^\w]").Replace(given.ToLower(), " ");
            //            TextInfo info = CultureInfo.CurrentCulture.TextInfo;
            //            givenTitleCase = info.ToTitleCase(givenTitleCase).Replace(" ", string.Empty);
            //            fileContent.Insert(whenLine, "");
            //            fileContent.Insert(whenLine, "\t\tCreate" + givenTitleCase + "();");
            //            fileContent.Insert(whenLine, "\t\t// [GIVEN] " + given);
            //            madeChanges = true;
            //        }
            //    }
            //    if (madeChanges)
            //    {
            //        File.WriteAllLines(dirtyMsg.FsPath, fileContent, System.Text.Encoding.Unicode);
            //    }

            //    var newMsgs = msg.Where(m => m.State == MessageState.New && m.FsPath == pathToDirtyFile);
            //    foreach (Message newMsg in newMsgs)
            //    {

            //        newMsg.Details.given
            //    }
            //}
        }
    }
}
