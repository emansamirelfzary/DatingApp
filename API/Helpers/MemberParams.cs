namespace API.Helpers;

public class MemberParams : PagingParams
{
    private const int MinAllowedAge = 18;
    private const int MaxAllowedAge = 100;
    private int _minAge = MinAllowedAge;
    private int _maxAge = MaxAllowedAge;

    public string? Gender { get; set; }
    public string? CurrentMemberId { get; set; }

    public int MinAge
    {
        get => _minAge;
        set => _minAge = Math.Clamp(value, MinAllowedAge, MaxAllowedAge);
    }

    public int MaxAge
    {
        get => _maxAge;
        set => _maxAge = Math.Clamp(value, MinAllowedAge, MaxAllowedAge);
    }

    public string OrderBy { get; set; } = "lastActive";
}
