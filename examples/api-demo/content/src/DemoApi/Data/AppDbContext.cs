using Microsoft.EntityFrameworkCore;

namespace DemoApi.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
