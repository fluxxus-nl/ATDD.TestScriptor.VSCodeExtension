using ATDD.TestScriptor.BackendServices.Models;
using ATDD.TestScriptor.Library;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ATDD.TestScriptor.BackendServices.Hubs
{
    public class ATDDHub : Hub<IATDDHub>
    {
        public async Task QueryProjects(IEnumerable<string> msg)
        {
            var projects = ALProjectCollector.Discover(msg.ToList());

            await Clients.All.GetProjects(projects);
        }

        public async Task QueryObjects(IEnumerable<string> msg)
        {
            using (var collector = new ALObjectCollector())
            {
                var objects = await collector.DiscoverLocalFiles(msg.ToList());
                var result = objects
                    .SelectMany(s => {
                        return (s.Symbol as TestALCodeunit).Features.SelectMany(x =>
                          {
                              return x.Scenarios.Select(sc =>
                              {
                                  var msg = new Message();
                                  msg.Project = s.Application;
                                  msg.Codeunit = s.Name;
                                  msg.Feature = x.Name;
                                  msg.Scenario = sc.Name;
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
                await Clients.All.GetObjects(result);
            }
        }

    }
}
