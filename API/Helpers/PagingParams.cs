using System;

namespace API.Helpers;

public class PagingParams
{
    private const int MaxPageSize = 50;
    private int _pageNumber = 1;
    private int _pageSize = 5;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = Math.Max(1, value);
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, MaxPageSize);
    }
}
