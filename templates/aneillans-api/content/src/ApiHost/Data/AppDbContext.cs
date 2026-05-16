using Microsoft.EntityFrameworkCore;

namespace ApiHost.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
