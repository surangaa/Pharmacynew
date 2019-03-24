using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace MyPharmacy.Web.Infrastructure
{
  public static class KendoUIQueryHelper
  {
    public static string BuildWhereClause<T>(GridFilters filter)
    {
      var whereclauseBuilder = new StringBuilder();
      if (filter.Filters == null || filter.Filters.Count == 0) return whereclauseBuilder.ToString();

      var entityType = (typeof(T));
      whereclauseBuilder.Append("WHERE");
      SetPropertyValue<T>(filter.Filters, entityType);
      whereclauseBuilder.Append(filter.MainFieldQuery);
      return whereclauseBuilder.ToString();
    }

    private static void SetPropertyValue<T>(IEnumerable<GridFilter> filters, Type entityType)
    {
      foreach (var currentFilter in filters)
      {
        if (currentFilter.Field == null)
        {
          SetPropertyValue<T>(currentFilter.Filters, entityType);
          continue;
        }
        var property = entityType.GetProperty(currentFilter.Field);
        if (typeof(DateTime).IsAssignableFrom(property.PropertyType) ||
            typeof(DateTime?).IsAssignableFrom(property.PropertyType))
        {
          var dateTimeValue = DateTime.ParseExact(Regex.Split(currentFilter.Value, " GMT+")[0], "ddd MMM dd yyyy HH:mm:ss",
            CultureInfo.InvariantCulture);
          currentFilter.Value = dateTimeValue.ToString("yyyy-MM-dd HH:mm:ss");
        }
        else if (typeof(int).IsAssignableFrom(property.PropertyType) || typeof(int?).IsAssignableFrom(property.PropertyType))
        {
          currentFilter.Value = Math.Truncate(decimal.Parse(currentFilter.Value)).ToString(CultureInfo.InvariantCulture);
        }
      }
    }

    public static string BuildOrderByClause(List<GridSort> sorts)
    {
      var orderByclauseBuilder = new StringBuilder();
      if (sorts == null || sorts.Count == 0) return orderByclauseBuilder.ToString();
      orderByclauseBuilder.Append("ORDER BY ");
      orderByclauseBuilder.Append(sorts.Select(x => x.FieldQuery).Aggregate((a, b) => (a + ", " + b)));
      return orderByclauseBuilder.ToString();
    }
  }

  public class GridGroup
  {
    public string Field { get; set; }
    public string Dir { get; set; }
  }

  public class GridSort
  {
    public string Field { get; set; }
    public string Dir { get; set; }
    public string FieldQuery
    {
      get
      {
        return string.Format("{0} {1}", Field, Dir);
      }
    }
  }

  public class GridFilter
  {
    public string Operator { get; set; }
    public string Field { get; set; }
    public string Value { get; set; }
    public string Logic { get; set; }

    public List<GridFilter> Filters { get; set; }

    public string FieldQuery
    {
      get
      {
        if (Filters != null && Filters.Count > 0)
        {
          return Filters.Select(x => x.FieldQuery).Aggregate((a, b) => (a + Logic.ToUpper() + b));
        }
        return string.Format(ToSqlOperator(Operator), Value, Field);
      }
    }

    private static string ToSqlOperator(string @operator)
    {
      switch (@operator.ToLower())
      {
        case "eq": return " {1} = '{0}' ";
        case "neq": return " {1} != '{0}' ";
        case "gte": return " {1} >= '{0}' ";
        case "gt": return " {1} > '{0}' ";
        case "lte": return " {1} <= '{0}' ";
        case "lt": return " {1} < '{0}' ";
        case "startswith": return " {1} LIKE '{0}%' ";
        case "endswith": return " {1} LIKE '%{0}' ";
        case "contains": return " {1} LIKE '%{0}%' ";
        case "doesnotcontain": return " {1} NOT LIKE '%{0}%' ";
        default: return "";
      }
    }
  }

  public class GridFilters
  {
    public List<GridFilter> Filters { get; set; }
    public string Logic { get; set; }
    public string MainFieldQuery
    {
      get
      {
        if (Filters != null && Filters.Count > 0)
        {
          return Filters.Select(x => "(" + x.FieldQuery + ")").Aggregate((a, b) => (a + " " + Logic.ToUpper() + " " + b));
        }
        return null;
      }
    }
  }
}