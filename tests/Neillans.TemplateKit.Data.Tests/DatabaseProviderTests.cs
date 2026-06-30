using Neillans.TemplateKit.Data;
using FluentAssertions;
using Xunit;

namespace Neillans.TemplateKit.Data.Tests;

public sealed class DatabaseProviderTests
{
    [Fact]
    public void PostgreSqlShouldBeDefaultEnumValue()
    {
        var value = default(DatabaseProvider);
        value.Should().Be(DatabaseProvider.PostgreSql);
    }
}
