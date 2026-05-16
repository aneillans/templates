using Aneillans.TemplateKit.Data;
using FluentAssertions;

namespace Aneillans.TemplateKit.Data.Tests;

public sealed class DatabaseProviderTests
{
    [Fact]
    public void Sqlite_ShouldBeDefaultEnumValue()
    {
        var value = default(DatabaseProvider);
        value.Should().Be(DatabaseProvider.Sqlite);
    }
}
