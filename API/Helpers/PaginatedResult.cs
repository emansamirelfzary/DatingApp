using Microsoft.EntityFrameworkCore;
using System;

namespace API.Helpers;

public class PaginatedResult<T>
{
    public PaginationMetadata Metadata { get; set; } = default!;
    public List<T> Items { get; set; } = default!;

    public static async Task<PaginatedResult<T>> CreateAsync(IQueryable<T> query, int pageNumber, int pageSize)
    {
        var count = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var metadata = new PaginationMetadata
        {
            CurrentPage = pageNumber,
            PageSize = pageSize,
            TotalCount = count,
            TotalPages = (int)Math.Ceiling(count / (double)pageSize)
        };

        return new PaginatedResult<T>
        {
            Metadata = metadata,
            Items = items
        };
    }
}

public class PaginationMetadata
{
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
