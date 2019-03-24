using System.Web.Http.ExceptionHandling;
using NLog;

namespace MyPharmacy.Web.Infrastructure
{
  public class UnhandledExceptionLogger : ExceptionLogger
  {
    public override void Log(ExceptionLoggerContext context)
    {
      var message = context.Exception.ToString();
      var log = LogManager.GetCurrentClassLogger();
      log.Fatal(message);
    }
  }
}