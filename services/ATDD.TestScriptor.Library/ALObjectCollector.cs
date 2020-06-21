using System;
using Newtonsoft.Json;
using System.IO;
using System.Linq;
using ICSharpCode.SharpZipLib.Core;
using ICSharpCode.SharpZipLib.Zip;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using ALObjectParser.Library;
using ALObjectParser;

namespace ATDD.TestScriptor.Library
{
    public class ALObjectCollector : IDisposable
    {
        public List<string> WorkspacePath { get; set; }

        public string[] Types
        {
            get
            {
                return new string[] {
                    "Codeunits"
                };
            }
            private set { }
        }

        public Dictionary<ALObjectParser.ALObjectType, string> ALTypeMap
        {
            get
            {
                var result = new Dictionary<ALObjectParser.ALObjectType, string>();
                result.Add(ALObjectParser.ALObjectType.codeunit, "Codeunits");

                return result;
            }
            private set { }
        }

        public ALObjectCollector()
        {
        }

        public ALObjectCollector(List<string> wkspcePaths)
        {
            WorkspacePath = wkspcePaths;
        }

        public async Task<List<CollectorItem>> Discover()
        {
            var result = await DiscoverLocalFiles(WorkspacePath);

            return result;
        }

        public async Task<List<CollectorItem>> DiscoverLocalFiles(List<string> wkspcePaths)
        {
            var projects = ALProjectCollector.Discover(wkspcePaths);
            var srcDirs = projects.Select(s => Directory.GetParent(s.FilePath).FullName).ToArray();
            var result = new List<CollectorItem>();
            var tasks = new List<Task<List<CollectorItem>>>();

            foreach (var project in projects)
            {
                var path = Directory.GetParent(project.FilePath).FullName;
                var localSymbols = Directory
                    .GetDirectories(path)
                    .SelectMany(s => Directory.GetFiles(s, "*.al", SearchOption.AllDirectories))
                    .Select(item => Task.Run(() => DiscoverLocalFile(item, project)));

                tasks.AddRange(localSymbols);
            }

            var subResult = await Task.WhenAll(tasks);
            result = subResult.SelectMany(s => s).ToList();

            return result;
        }

        public List<CollectorItem> DiscoverLocalFile(string itemPath, ALProject project = null)
        {
            if (project is null)
            {
                project = ALProjectCollector.Discover(itemPath);
            }

            var collectorItems = new List<CollectorItem>();
            var alobjects = ALParser.Read(itemPath);
            foreach (var alobject in alobjects)
            {
                if (alobject.Type == ALObjectType.codeunit)
                {
                    bool isTestCodeunit = alobject
                   .Properties
                   .Any(p => p.Name.ToLower() == "subtype" && p.Value.ToLower() == "test");

                    if (isTestCodeunit)
                    {

                        var testCodeunit = ALParser.Read<ALTestCodeunitReader>(itemPath).FirstOrDefault();

                        collectorItems.Add(new CollectorItem
                        {
                            TypeId = alobject.Type,
                            Id = alobject.Id,
                            Type = $"{alobject.Type}",
                            Publisher = project.publisher,
                            Version = project.version.ToString(),
                            Symbol = testCodeunit,
                            FsPath = itemPath,
                            Name = alobject.Name,
                            Application = project.name,
                            IsLocal = true,
                            ProjectPath = project.FilePath,
                            SymbolData = new SymbolData
                            {
                                Index = alobject.Id,
                                Path = itemPath,
                                Type = alobject.Type,
                                Name = alobject.Name
                            }
                        });
                    }
                }
            }

            //alobjects.ToList().Clear();

            return collectorItems;
        }

        public List<FileInfo> GetSymbolPaths(List<string> wkspcePaths)
        {
            var symbolPaths = new List<FileInfo>();
            foreach (var path in wkspcePaths)
            {
                var files = Directory
                    .GetDirectories(path, ".alpackages", SearchOption.AllDirectories)
                    .SelectMany(s => Directory.GetFiles(s, "*.app"))
                    .Select(s => new FileInfo(s))
                    .ToList();

                symbolPaths.AddRange(files);
            }

            symbolPaths = symbolPaths
                .Distinct(new FileInfoNameComparer())
                .ToList();

            return symbolPaths;
        }

        public async Task<SymbolReference> GetSymbolReference(string symbolPath, bool mapSourcePath = true)
        {
            var symbolRef = new SymbolReference();

            using (Stream fs = File.OpenRead(symbolPath))
            {
                using (var zf = new ZipFile(fs))
                {
                    var zipEntry = zf.GetEntry("SymbolReference.json");

                    using (var entryStream = zf.GetInputStream(zipEntry))
                    {
                        using (var zipStream = new StreamReader(entryStream))
                        {
                            var serializer = new JsonSerializer();
                            using (var jsonTextReader = new JsonTextReader(zipStream))
                            {
                                symbolRef = serializer.Deserialize<SymbolReference>(jsonTextReader);
                                symbolRef.Codeunits = symbolRef.Codeunits.Select(x => { x.Type = ALObjectParser.ALObjectType.codeunit; return x; });

                                symbolRef.Symbols.AddRange(symbolRef.Codeunits);

                                //GC.Collect();

                                symbolRef.Path = symbolPath;
                            }
                        }
                    }

                    if (mapSourcePath)
                    {
                        IEnumerable<ALObject> objHeaders = new List<ALObject>();
                        List<Task<ALObject>> tasks = new List<Task<ALObject>>();
                        foreach (ZipEntry item in zf)
                        {
                            tasks.Add(Task.Run(() =>
                            {
                                if (item.IsFile && item.Name.EndsWith(".al"))
                                {
                                    using (var xstr = zf.GetInputStream(item))
                                    {
                                        using (var txtrdr = new StreamReader(xstr))
                                        {
                                            var objStr = txtrdr.ReadToEnd();
                                            var parser = new ALObjectReaderBase();
                                            var info = parser.ReadObjectInfosFromString(objStr);
                                            var infoItem = info.FirstOrDefault() as ALObject;
                                            if (infoItem != null)
                                            {
                                                infoItem.SymbolZipName = item.ZipFileIndex.ToString();
                                                return infoItem;
                                            }
                                        }
                                    }
                                }

                                return null;
                            }));
                        }

                        objHeaders = await Task.WhenAll(tasks);
                        objHeaders = objHeaders.Where(x => x != null);

                        /*symbolRef.Symbols.Where(w => objHeaders.Any(a => a.Type == w.Type && a.Name == w.Name)).Select(x =>
                        {
                            x.SymbolZipName = objHeaders.FirstOrDefault(f => f.Type == x.Type && f.Name == x.Name)?.SymbolZipName;
                            return x;
                        })
                        .ToList();*/

                        symbolRef.Symbols = symbolRef.Symbols
                            .Select(x =>
                            {
                                x.SymbolZipName = objHeaders.FirstOrDefault(f => f.Type == x.Type && f.Name == x.Name)?.SymbolZipName;
                                return x;
                            })
                            .ToList();
                    }
                }
            }

            //GC.Collect();

            return symbolRef;
        }

        public async Task<IALObject> GetSymbolObject(SymbolData data, bool mapSourcePath = true)
        {
            FileInfo info = new FileInfo(data.Path);
            if (info.Extension == ".al")
            {
                var alobjects = ALParser.Read(data.Path);
                var alobject = alobjects.FirstOrDefault(f => f.Type == data.Type && f.Name == data.Name);
                var project = ALProjectCollector.Discover(data.Path);

                return alobject;
            }

            var symbols = await GetSymbolReference(data.Path, mapSourcePath);
            var result = symbols.Symbols.Where(w => w.Type == data.Type && w.Name == data.Name).FirstOrDefault();

            return await Task.FromResult(result);
        }

        public async Task<string> GetSymbolContent(SymbolData data)
        {
            string result;
            if (String.IsNullOrEmpty(data.SymbolZipName))
            {
                var alobj = await GetSymbolObject(data, true);
                result = ALParser.Write(alobj);
                return await Task.FromResult(result);
            }

            using (Stream fs = File.OpenRead(data.Path))
            {
                using (var zf = new ZipFile(fs))
                {
                    int i;
                    int.TryParse(data.SymbolZipName, out i);
                    var zipEntry = zf[i];

                    using (var entryStream = zf.GetInputStream(zipEntry))
                    {
                        using (var zipStream = new StreamReader(entryStream))
                        {
                            result = zipStream.ReadToEnd();
                            return await Task.FromResult(result);
                        }
                    }
                }
            }
        }

        public void Dispose()
        {
            GC.Collect();
        }
    }
}
