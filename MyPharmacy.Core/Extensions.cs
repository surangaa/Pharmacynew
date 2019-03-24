using System;
using System.Collections.Generic;
using System.Linq;

namespace MyPharmacy.Core
{
  public static class Extensions
  {
    public static IEnumerable<string> Messages(this Exception ex)
    {
      // return an empty sequence if the provided exception is null
      if (ex == null) { yield break; }
      // first return THIS exception's message at the beginning of the list
      yield return ex.Message;
      // then get all the lower-level exception messages recursively (if any)
      IEnumerable<Exception> innerExceptions = Enumerable.Empty<Exception>();

      if (ex is AggregateException && (ex as AggregateException).InnerExceptions.Any())
      {
        innerExceptions = (ex as AggregateException).InnerExceptions;
      }
      else if (ex.InnerException != null)
      {
        innerExceptions = new[] { ex.InnerException };
      }

      foreach (var innerEx in innerExceptions)
      {
        foreach (string msg in innerEx.Messages())
        {
          yield return msg;
        }
      }
    }

    public static DateTime StartOfWeek(this DateTime dateTime, DayOfWeek startOfWeek)
    {
      var diff = dateTime.DayOfWeek - startOfWeek;
      if (diff < 0)
      {
        diff += 7;
      }
      return dateTime.AddDays(-1 * diff).Date;
    }

    public static DateTime StartOfWeekMonday(this DateTime dateTime)
    {
      var diff = dateTime.DayOfWeek - DayOfWeek.Monday;
      if (diff < 0)
      {
        diff += 7;
      }
      return dateTime.AddDays(-1 * diff).Date;
    }
  }
}