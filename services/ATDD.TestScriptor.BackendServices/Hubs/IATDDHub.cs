using ATDD.TestScriptor.BackendServices.Models;
using ATDD.TestScriptor.Library;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ATDD.TestScriptor.BackendServices.Hubs
{
    public interface IATDDHub
    {
        Task GetProjects(IEnumerable<ALProject> msg);
        Task GetObjects(IEnumerable<Message> msg);
        Task SaveChangesResponse(bool response);
        Task CheckSaveChangesResponse(bool response);
    }
}