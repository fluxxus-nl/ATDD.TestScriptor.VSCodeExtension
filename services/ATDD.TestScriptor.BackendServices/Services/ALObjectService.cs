using ATDD.TestScriptor.BackendServices.Models;
using ATDD.TestScriptor.Library;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ATDD.TestScriptor.BackendServices.Services
{
    public interface IALObjectService
    {
        Task<List<Message>> GetTests(IEnumerable<string> paths);
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
    }
}
