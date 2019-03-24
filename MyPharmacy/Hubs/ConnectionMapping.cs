using System.Collections.Generic;
using System.Linq;

namespace MyPharmacy.Web.Hubs
{
  public class ConnectionMapping<T>
  {
    private readonly Dictionary<T, HashSet<string>> connectionsDireDictionary =
            new Dictionary<T, HashSet<string>>();

    public int Count
    {
      get
      {
        return connectionsDireDictionary.Count;
      }
    }

    public void Add(T key, string connectionId)
    {
      lock (connectionsDireDictionary)
      {
        HashSet<string> connections;
        if (!connectionsDireDictionary.TryGetValue(key, out connections))
        {
          connections = new HashSet<string>();
          connectionsDireDictionary.Add(key, connections);
        }

        lock (connections)
        {
          connections.Add(connectionId);
        }
      }
    }

    public IEnumerable<string> GetConnections(T key)
    {
      HashSet<string> connections;
      if (connectionsDireDictionary.TryGetValue(key, out connections))
      {
        return connections;
      }

      return Enumerable.Empty<string>();
    }

    public void Remove(T key, string connectionId)
    {
      lock (connectionsDireDictionary)
      {
        HashSet<string> connections;
        if (!connectionsDireDictionary.TryGetValue(key, out connections))
        {
          return;
        }

        lock (connections)
        {
          connections.Remove(connectionId);

          if (connections.Count == 0)
          {
            connectionsDireDictionary.Remove(key);
          }
        }
      }
    }
  }
}