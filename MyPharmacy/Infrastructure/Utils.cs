using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace MyPharmacy.Web.Infrastructure
{
    public class Utils
    {
        public static IEnumerable<List<T>> SplitList<T>(List<T> locations, int nSize = 30)
        {
            for (int i = 0; i < locations.Count; i += nSize)
            {
                yield return locations.GetRange(i, Math.Min(nSize, locations.Count - i));
            }
        }

        public static DateTime? TryParseAnyDateFormat(string dateString, string[] dateFormats)
        {
            DateTime parsedDate;
            foreach (var format in dateFormats)
            {
                if (DateTime.TryParseExact(dateString, format, System.Globalization.CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate))
                {
                    return parsedDate;
                }
            }
            return null;
        }

    }
}