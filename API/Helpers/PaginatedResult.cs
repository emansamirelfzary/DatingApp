
using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class PaginatedResult<T>
{
    public PaginationMetadata Metadata { get; set; } = default!;
    public List<T> Items { get; set; } = [];

    public static async Task<PaginatedResult<T>> CreateAsync(
        IQueryable<T> query,
        int pageNumber,
        int pageSize)
    {
        if (pageNumber < 1)
            throw new ArgumentOutOfRangeException(nameof(pageNumber));

        if (pageSize < 1)
            throw new ArgumentOutOfRangeException(nameof(pageSize));

        var count = await query.CountAsync();

        var totalPages = (int)Math.Ceiling(count / (double)pageSize);

        var currentPage = totalPages == 0
            ? 1
            : Math.Min(pageNumber, totalPages);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var metadata = new PaginationMetadata
        {
            CurrentPage = currentPage,
            PageSize = pageSize,
            TotalCount = count,
            TotalPages = totalPages
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
