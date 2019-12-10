using ATDD.TestScriptor.BackendServices.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ATDD.TestScriptor.BackendServices.Hubs
{
    public class ALHub: Hub
    {
        public Task QueryProjects(string msg)
        {
            return Clients.All.SendAsync("GetProjects", msg);
        }

    }
}
