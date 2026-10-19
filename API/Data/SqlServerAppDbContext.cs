using Microsoft.EntityFrameworkCore;

namespace API.Data;

/// <summary>
/// Uses a separate migration history from the SQLite-backed AppDbContext.
/// Both contexts map the same application model.
/// </summary>
public sealed class SqlServerAppDbContext(DbContextOptions<SqlServerAppDbContext> options)
    : AppDbContextBase<SqlServerAppDbContext>(options);
