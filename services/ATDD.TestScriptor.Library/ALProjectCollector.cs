using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class ALProjectCollector
    {
        public ALProjectCollector()
        {
        }

        public static IEnumerable<FileInfo> GetProjectInfo(List<string> wkspcePaths)
        {
            var result = new List<FileInfo>();
            foreach (var path in wkspcePaths)
            {
                var files = Directory
                    .GetFiles(path, "app.json", SearchOption.AllDirectories)
                    .Select(s => new FileInfo(s));

                result.AddRange(files);
            }

            return result;
        }

        public static FileInfo GetProjectInfo(string filePath)
        {
            filePath = Path.GetDirectoryName(filePath);
            FileInfo result;
            do
            {
                result = Directory
                        .GetFiles(filePath, "app.json", SearchOption.AllDirectories)
                        .Select(s => new FileInfo(s))
                        .FirstOrDefault();

                filePath = Directory.GetParent(filePath).FullName;
            } while (result == null);

            return result;
        }

        public static IEnumerable<ALProject> Discover(List<string> wkspcePaths)
        {
            var paths = ALProjectCollector.GetProjectInfo(wkspcePaths).Select(s => s.FullName);

            var projects = paths.Select(s =>
            {
                var fileContent = File.ReadAllText(s);
                var result = JsonConvert.DeserializeObject<ALProject>(fileContent);
                result.FilePath = s;
                return result;
            });

            return projects.ToList();
        }

        public static ALProject Discover(string wkspcePaths)
        {
            var paths = ALProjectCollector.GetProjectInfo(wkspcePaths).FullName;

            var fileContent = File.ReadAllText(paths);
            var result = JsonConvert.DeserializeObject<ALProject>(fileContent);
            result.FilePath = wkspcePaths;

            return result;
        }
    }
}
