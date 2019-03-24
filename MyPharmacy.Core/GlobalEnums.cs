namespace MyPharmacy.Core
{
  public enum ActionStatuses
  {
    None = 10,
    ForReview = 20,
    Approved = 30,
    Rejected = 40,
    Cancelled = 50
  }

  public enum ActionTypes
  {
    IncreaseFrequency = 5,
    UnallocateVisit = 15,
    EditVisitTime = 20,
    EditVisitType = 25,
    EditCallDaySleepoutType = 30,
    DecreaseFrequency = 35
  }
}
