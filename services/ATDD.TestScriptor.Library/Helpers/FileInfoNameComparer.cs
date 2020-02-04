using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace ATDD.TestScriptor.Library
{
    public class FileInfoNameComparer : IEqualityComparer<FileInfo>
    {
        public bool Equals(FileInfo x, FileInfo y)
        {
            return x.Name == y.Name;
        }

        public int GetHashCode(FileInfo obj)
        {
            return ($"{obj.Name}").GetHashCode();
        }
    }
}
