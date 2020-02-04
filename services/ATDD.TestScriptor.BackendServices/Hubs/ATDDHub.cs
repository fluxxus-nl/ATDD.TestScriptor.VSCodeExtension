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
                var projects = collector.DiscoverLocalFiles(msg.ToList());
                await Clients.All.GetObjects(projects);
            }
        }

    }
}
